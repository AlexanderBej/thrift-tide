import React from 'react';
import { ComputedDatum, PieCustomLayer, PieCustomLayerProps } from '@nivo/pie';
import { RawDatum } from './double-donut.component';
import { arc as d3Arc, DefaultArcObject } from 'd3-shape';

type CustomLayerProps<T> = {
  dataWithArc: ComputedDatum<T>[];
  centerX: number;
  centerY: number;
  radius: number;
  innerRadius: number;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const PieOverlay: PieCustomLayer<RawDatum> = ({
  dataWithArc,
  centerX,
  centerY,
  radius,
  innerRadius,
}: PieCustomLayerProps<RawDatum>) => {
  const ringThickness = radius - innerRadius;

  const overlayArcGen = d3Arc<DefaultArcObject>().cornerRadius(8);

  return (
    <g transform={`translate(${centerX}, ${centerY})`}>
      {dataWithArc.map((d) => {
        const item = d.data.raw;
        const allocated = item.allocated || 0;
        const used = item.used || 0;
        if (allocated <= 0 || used <= 0) return null;

        const usedRatio = clamp01(used / allocated);
        const overlayInner = innerRadius + 2;
        const overlayOuter = innerRadius + ringThickness * usedRatio - 2;
        if (overlayOuter <= overlayInner) return null;

        const path = overlayArcGen({
          startAngle: d.arc.startAngle,
          endAngle: d.arc.endAngle,
          innerRadius: overlayInner,
          outerRadius: overlayOuter,
          padAngle: 0,
        });

        const fill = item.strongColor || item.color || '#8884d8';
        return <path key={d.id} d={path ?? undefined} fill={fill} />;
      })}
    </g>
  );
};

export default PieOverlay;
