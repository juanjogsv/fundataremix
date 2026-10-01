import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LoadAwareImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  frameClassName?: string;
};

export function LoadAwareImage({
  className,
  frameClassName,
  onLoad,
  onError,
  ...props
}: LoadAwareImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", frameClassName)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />}
      <img
        {...props}
        className={cn(className, loaded ? "opacity-100" : "opacity-0")}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setLoaded(true);
          onError?.(event);
        }}
      />
    </div>
  );
}