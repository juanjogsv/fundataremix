import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Loader2, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCoordinatesByDaneCode, normalizeDaneCode } from '@/lib/colombia-municipalities';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Point, FeatureCollection } from 'geojson';
import { PageHeader } from "@/components/PageHeader";

// Free vector tile style from Carto (no token required)
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const MARKER_COLOR = '#009EAE';

interface MunicipalityData {
  cod_entidad: string;
  entidad: string;
  departamento: string;
  totalBeneficiarios: number;
  programas: string[];
  programasDetalle: { programa: string; valor: number }[];
}

const Map = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  // Fetch data from rural_beneficiaries
  const { data: beneficiariesData, isLoading: isDataLoading } = useQuery({
    queryKey: ['map-beneficiaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rural_beneficiaries')
        .select('*')
        .not('cod_entidad', 'is', null);
      
      if (error) throw error;
      return data;
    }
  });

  // Get unique years for filter
  const years = useMemo(() => {
    if (!beneficiariesData) return [];
    const yearsSet = new Set<number>();
    beneficiariesData.forEach(item => {
      if (item.year) yearsSet.add(item.year);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [beneficiariesData]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    if (!beneficiariesData) return [];
    const deptSet = new Set<string>();
    beneficiariesData.forEach(item => {
      if (item.departamento) deptSet.add(item.departamento);
    });
    return Array.from(deptSet).sort();
  }, [beneficiariesData]);

  // Process and group data by municipality
  const municipalitiesData = useMemo(() => {
    if (!beneficiariesData) return [];

    // Filter by year and department
    let filtered = beneficiariesData;
    if (selectedYear !== "all") {
      filtered = filtered.filter(item => item.year === parseInt(selectedYear));
    }
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(item => item.departamento === selectedDepartment);
    }

    // Group by cod_entidad
    const grouped: Record<string, MunicipalityData> = {};
    
    filtered.forEach(item => {
      const code = normalizeDaneCode(item.cod_entidad);
      if (!code) return;
      
      if (!grouped[code]) {
        grouped[code] = {
          cod_entidad: code,
          entidad: item.entidad || '',
          departamento: item.departamento || '',
          totalBeneficiarios: 0,
          programas: [],
          programasDetalle: []
        };
      }
      
      const municipality = grouped[code];
      municipality.totalBeneficiarios += item.valor || 0;
      
      if (item.programa) {
        if (!municipality.programas.includes(item.programa)) {
          municipality.programas.push(item.programa);
        }
        // Add to detail - aggregate by programa
        const existingPrograma = municipality.programasDetalle.find(p => p.programa === item.programa);
        if (existingPrograma) {
          existingPrograma.valor += item.valor || 0;
        } else {
          municipality.programasDetalle.push({
            programa: item.programa,
            valor: item.valor || 0
          });
        }
      }
    });

    return Object.values(grouped).filter((m: MunicipalityData) => m.totalBeneficiarios > 0);
  }, [beneficiariesData, selectedYear, selectedDepartment]);

  // Convert municipalities data to GeoJSON
  const geojsonData = useMemo(() => {
    const features = (municipalitiesData as MunicipalityData[])
      .map(municipality => {
        const coords = getCoordinatesByDaneCode(municipality.cod_entidad);
        if (!coords) return null;
        
        return {
          type: 'Feature' as const,
          properties: {
            cod_entidad: municipality.cod_entidad,
            entidad: municipality.entidad || coords.name,
            departamento: municipality.departamento,
            totalBeneficiarios: municipality.totalBeneficiarios,
            programas: municipality.programas.join(', '),
            programasDetalle: JSON.stringify(municipality.programasDetalle.sort((a, b) => b.valor - a.valor))
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [coords.lng, coords.lat]
          }
        };
      })
      .filter(Boolean);

    return {
      type: 'FeatureCollection' as const,
      features
    };
  }, [municipalitiesData]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-74.2973, 4.5709], // Colombia center
      zoom: 5,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => {
      // Add cluster source
      map.current!.addSource('municipalities', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        clusterProperties: {
          sum: ['+', ['get', 'totalBeneficiarios']]
        }
      });

      // Cluster circles layer
      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'municipalities',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': MARKER_COLOR,
          'circle-radius': [
            'step',
            ['get', 'sum'],
            20,    // default size
            500, 25,
            1000, 30,
            5000, 35,
            10000, 40
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Cluster count labels
      map.current!.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'municipalities',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': [
            'case',
            ['>=', ['get', 'sum'], 1000],
            ['concat', ['to-string', ['/', ['round', ['/', ['get', 'sum'], 100]], 10]], 'k'],
            ['to-string', ['get', 'sum']]
          ],
          'text-font': ['Open Sans Semibold','Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Unclustered point circles
      map.current!.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'municipalities',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': MARKER_COLOR,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'totalBeneficiarios'],
            0, 12,
            100, 16,
            500, 20,
            1000, 24,
            5000, 28
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Unclustered point labels
      map.current!.addLayer({
        id: 'unclustered-label',
        type: 'symbol',
        source: 'municipalities',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': [
            'case',
            ['>=', ['get', 'totalBeneficiarios'], 1000],
            ['concat', ['to-string', ['/', ['round', ['/', ['get', 'totalBeneficiarios'], 100]], 10]], 'k'],
            ['to-string', ['get', 'totalBeneficiarios']]
          ],
          'text-font': ['Open Sans Semibold','Arial Unicode MS Bold'],
          'text-size': 11
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Click on cluster to zoom in
      map.current!.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties?.cluster_id;
        const source = map.current!.getSource('municipalities') as maplibregl.GeoJSONSource;
        
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.current!.easeTo({
            center: (features[0].geometry as Point).coordinates as [number, number],
            zoom: zoom
          });
        }).catch(() => {});
      });

      // Click on unclustered point to show popup
      map.current!.on('click', 'unclustered-point', (e) => {
        if (!e.features || !e.features[0]) return;
        
        const coordinates = (e.features[0].geometry as Point).coordinates.slice() as [number, number];
        const props = e.features[0].properties;
        
        // Close existing popup
        if (popupRef.current) {
          popupRef.current.remove();
        }
        
        // Parse programas detail for table
        let programasTable = '';
        try {
          const detalles = JSON.parse(props?.programasDetalle || '[]') as { programa: string; valor: number }[];
          if (detalles.length > 0) {
            programasTable = `
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px;">
                <thead>
                  <tr style="background: #EFEAE1;">
                    <th style="text-align: left; padding: 8px; border-bottom: 2px solid rgba(98,62,25,.22); color: #623E19;">Proyecto</th>
                    <th style="text-align: right; padding: 8px; border-bottom: 2px solid rgba(98,62,25,.22); color: #623E19;">Beneficiarios</th>
                  </tr>
                </thead>
                <tbody>
                  ${detalles.map((d, i) => `
                    <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#FAF8F3'};">
                      <td style="padding: 6px 8px; border-bottom: 1px solid rgba(98,62,25,.16); color: #623E19;">${d.programa}</td>
                      <td style="padding: 6px 8px; border-bottom: 1px solid rgba(98,62,25,.16); text-align: right; font-weight: 700; color: #007B88;">${d.valor.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;
          }
        } catch (e) {
          console.error('Error parsing programas:', e);
        }
        
        popupRef.current = new maplibregl.Popup({ offset: 25, maxWidth: '350px', anchor: 'bottom', closeOnClick: false })
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 12px; min-width: 300px; max-height: 400px; overflow-y: auto;">
              <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 4px 0; color: #623E19;">
                ${props?.entidad}
              </h3>
              <p style="font-size: 13px; color: rgba(98,62,25,.75); margin: 0 0 12px 0;">
                ${props?.departamento}
              </p>
              <div style="background: #009EAE; border-radius: 8px; padding: 12px; margin-bottom: 12px; color: white;">
                <div style="font-size: 28px; font-weight: 700;">
                  ${Number(props?.totalBeneficiarios).toLocaleString()}
                </div>
                <div style="font-size: 12px; opacity: 0.9;">
                  Beneficiarios totales
                </div>
              </div>
              <div style="font-size: 13px; font-weight: 700; color: #623E19; margin-bottom: 4px;">
                📋 Desglose por Proyecto
              </div>
              ${programasTable || '<p style="color: rgba(98,62,25,.58); font-size: 12px;">Sin datos detallados</p>'}
              <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(98,62,25,.16); font-size: 11px; color: rgba(98,62,25,.58);">
                📍 Código DANE: ${props?.cod_entidad}
              </div>
            </div>
          `)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current!.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current!.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = '';
      });
      map.current!.on('mouseenter', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current!.on('mouseleave', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = '';
      });

      setIsLoading(false);
    });

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update source data when municipalities data changes
  useEffect(() => {
    if (!map.current || isLoading) return;
    
    const source = map.current.getSource('municipalities') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geojsonData as FeatureCollection);
    }
  }, [geojsonData, isLoading]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Mapa de Participantes" mobileTitle="Mapa" subtitle="Presencia territorial de los programas por municipio" icon={MapPin} iconBgColor="bg-kit-teal" />
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-[1400px] space-y-8">

        {/* Filters */}
        <div className="rounded-[var(--radius)] border border-border bg-[hsl(var(--filter-surface))] shadow-card">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los departamentos</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="ml-auto text-sm text-muted-foreground">
                {municipalitiesData.length} municipios • {' '}
                {(municipalitiesData as MunicipalityData[]).reduce((acc, m) => acc + m.totalBeneficiarios, 0).toLocaleString()} participantes
              </div>
            </div>
          </CardContent>
        </div>

        {/* Map Container */}
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa Interactivo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="relative aspect-[16/9] min-h-[500px]">
              {(isLoading || isDataLoading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Cargando mapa...</span>
                  </div>
                </div>
              )}
              <div 
                ref={mapContainer} 
                className="absolute inset-0 rounded-b-lg"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Map;
