import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2, ExternalLink } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCoordinatesByDaneCode, normalizeDaneCode } from '@/lib/colombia-municipalities';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, FeatureCollection, Point } from 'geojson';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const MARKER_COLOR = '#6366f1';

interface MunicipalityData {
  cod_entidad: string;
  entidad: string;
  departamento: string;
  totalBeneficiarios: number;
  programas: string[];
  programasDetalle: { programa: string; valor: number }[];
}

export const EmbeddedMapCard = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: beneficiariesData, isLoading: isDataLoading } = useQuery({
    queryKey: ['embedded-map-beneficiaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rural_beneficiaries')
        .select('*')
        .not('cod_entidad', 'is', null);
      
      if (error) throw error;
      return data;
    }
  });

  const municipalitiesData = useMemo(() => {
    if (!beneficiariesData) return [];

    const grouped: Record<string, MunicipalityData> = {};
    
    beneficiariesData.forEach(item => {
      const code = normalizeDaneCode(item.cod_entidad);
      if (!code || code.length < 3) return;
      
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
  }, [beneficiariesData]);

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

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-74.2973, 4.5709],
      zoom: 4.5,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.current.on('load', () => {
      map.current!.addSource('municipalities', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 40,
        clusterProperties: {
          sum: ['+', ['get', 'totalBeneficiarios']]
        }
      });

      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'municipalities',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': MARKER_COLOR,
          'circle-radius': ['step', ['get', 'sum'], 15, 500, 18, 1000, 22, 5000, 26],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

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
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 10
        },
        paint: { 'text-color': '#ffffff' }
      });

      map.current!.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'municipalities',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': MARKER_COLOR,
          'circle-radius': ['interpolate', ['linear'], ['get', 'totalBeneficiarios'], 0, 8, 100, 10, 500, 14, 1000, 18],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

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
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 9
        },
        paint: { 'text-color': '#ffffff' }
      });

      map.current!.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties?.cluster_id;
        const source = map.current!.getSource('municipalities') as maplibregl.GeoJSONSource;
        
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.current!.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom
          });
        });
      });

      map.current!.on('click', 'unclustered-point', (e) => {
        if (!e.features || !e.features[0]) return;
        
        const coordinates = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        const props = e.features[0].properties;
        
        if (popupRef.current) popupRef.current.remove();
        
        let programasTable = '';
        try {
          const detalles = JSON.parse(props?.programasDetalle || '[]') as { programa: string; valor: number }[];
          if (detalles.length > 0) {
            programasTable = `
              <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="text-align: left; padding: 4px 6px; border-bottom: 1px solid #e5e7eb;">Proyecto</th>
                    <th style="text-align: right; padding: 4px 6px; border-bottom: 1px solid #e5e7eb;">Benef.</th>
                  </tr>
                </thead>
                <tbody>
                  ${detalles.slice(0, 5).map((d, i) => `
                    <tr style="background: ${i % 2 === 0 ? '#fff' : '#f9fafb'};">
                      <td style="padding: 3px 6px; font-size: 10px;">${d.programa}</td>
                      <td style="padding: 3px 6px; text-align: right; font-weight: 600; color: #059669;">${d.valor.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                  ${detalles.length > 5 ? `<tr><td colspan="2" style="padding: 3px 6px; font-size: 10px; color: #6b7280;">+${detalles.length - 5} más...</td></tr>` : ''}
                </tbody>
              </table>
            `;
          }
        } catch (e) {
          console.error('Error parsing programas:', e);
        }
        
        popupRef.current = new maplibregl.Popup({ offset: 15, maxWidth: '250px', anchor: 'left', closeOnClick: false })
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 2px 0;">${props?.entidad}</h3>
              <p style="font-size: 11px; color: #666; margin: 0 0 8px 0;">${props?.departamento}</p>
              <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 6px; padding: 8px; color: white;">
                <div style="font-size: 20px; font-weight: 700;">${Number(props?.totalBeneficiarios).toLocaleString()}</div>
                <div style="font-size: 10px; opacity: 0.9;">Beneficiarios</div>
              </div>
              ${programasTable}
            </div>
          `)
          .addTo(map.current!);
      });

      map.current!.on('mouseenter', 'clusters', () => { map.current!.getCanvas().style.cursor = 'pointer'; });
      map.current!.on('mouseleave', 'clusters', () => { map.current!.getCanvas().style.cursor = ''; });
      map.current!.on('mouseenter', 'unclustered-point', () => { map.current!.getCanvas().style.cursor = 'pointer'; });
      map.current!.on('mouseleave', 'unclustered-point', () => { map.current!.getCanvas().style.cursor = ''; });

      setIsLoading(false);
    });

    return () => {
      if (popupRef.current) popupRef.current.remove();
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!map.current || isLoading) return;
    
    const source = map.current.getSource('municipalities') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geojsonData as GeoJSON.FeatureCollection);
    }
  }, [geojsonData, isLoading]);

  const totalBeneficiarios = (municipalitiesData as MunicipalityData[]).reduce((acc, m) => acc + m.totalBeneficiarios, 0);

  return (
    <Card className="bg-white border border-gray-100 shadow-lg rounded-2xl overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-luker-green" />
          Mapa de Participantes
        </CardTitle>
        <a
          href="/mapa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-luker-green transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Ver completo
        </a>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="px-4 pb-2 flex items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-700">{municipalitiesData.length}</span> municipios
          <span className="font-medium text-luker-green">{totalBeneficiarios.toLocaleString()}</span> participantes
        </div>
        <div className="relative flex-1 min-h-[280px]">
          {(isLoading || isDataLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
          <div ref={mapContainer} className="absolute inset-0" />
        </div>
      </CardContent>
    </Card>
  );
};
