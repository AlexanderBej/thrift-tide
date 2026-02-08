import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';

import './carousel.styles.scss';

interface EmblaCarouselProps {
  children: React.ReactNode;
  loop?: boolean;
  showDots?: boolean;
}

const EmblaCarousel: React.FC<EmblaCarouselProps> = ({
  children,
  loop = false,
  showDots = true,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const onInit = React.useCallback((api: EmblaCarouselType) => {
    setSnapCount(api.scrollSnapList().length);
  }, []);

  const onSelect = React.useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
    // setCanPrev(api.canScrollPrev());
    // setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);

    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', () => onSelect(emblaApi));

    return () => {
      emblaApi.off('reInit', onInit);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {React.Children.map(children, (child) => (
            <div className="embla__slide">{child}</div>
          ))}
        </div>
      </div>

      {showDots && (
        <div className="embla__controls">
          {showDots && snapCount > 1 && (
            <div className="embla__dots" aria-label="Carousel pagination">
              {Array.from({ length: snapCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === selectedIndex ? 'embla__dot embla__dot--active' : 'embla__dot'}
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === selectedIndex ? 'true' : undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmblaCarousel;
