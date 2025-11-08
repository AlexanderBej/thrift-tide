import React from 'react';
import { useTranslation } from 'react-i18next';

import { getCssVar } from '../../utils/style-variable.util';
import FormInput from '../../components-ui/form-input/form-input.component';
import { Donut, DonutItem } from '../../components-ui/charts/donut.component';
import { useWindowWidth } from '../../utils/window-width.hook';
import { PercentTriple } from '../../api/types/percent.types';

import './percents-selectors.styles.scss';

interface PercentsSelectorsProps {
  percents: PercentTriple;
  onPercentsChange: (bucket: string, value: number) => void;
  showDonut?: boolean;
}

const PercentsSelectors: React.FC<PercentsSelectorsProps> = ({
  percents,
  onPercentsChange,
  showDonut = true,
}) => {
  const { t } = useTranslation(['common', 'budget']);
  const width = useWindowWidth();

  const isMobile = width < 480;

  const donutItems: DonutItem[] = [
    {
      id: 'needs',
      label: 'Needs',
      value: percents.needs * 100,
      color: getCssVar('--needs'),
    },
    {
      id: 'wants',
      label: 'Wants',
      value: percents.wants * 100,
      color: getCssVar('--wants'),
    },
    {
      id: 'savings',
      label: 'Savings',
      value: percents.savings * 100,
      color: getCssVar('--savings'),
    },
  ];

  const getTotalPercent = (): number => {
    return (percents.needs + percents.wants + percents.savings) * 100;
  };

  const getPctColor = (pct: number) => {
    if (pct < 90 || pct > 100) return 'error';
    else if (pct < 100) return 'warning';
    return 'success';
  };

  const getDonutPercentage = () => {
    const pct = getTotalPercent();

    return {
      value: pct,
      color: getCssVar(`--${getPctColor(pct)}`),
    };
  };

  return (
    <div className="percents-selectors-row">
      <div className="budget-sliders">
        {(['needs', 'wants', 'savings'] as const).map((key, index) => {
          const val =
            key === 'needs' ? percents.needs : key === 'wants' ? percents.wants : percents.savings;

          const inputVal = val * 100;
          return (
            <div className="budget-slider-row" key={index}>
              <FormInput
                label={
                  key === 'needs'
                    ? (t('budget:bucketNames.needs') ?? 'Needs')
                    : key === 'wants'
                      ? (t('budget:bucketNames.wants') ?? 'Wants')
                      : (t('budget:bucketNames.savings') ?? 'Savings')
                }
                name="slider"
                value={val}
                inputType="range"
                min={0}
                max={1}
                step={0.01}
                color={getCssVar(`--${key}`)}
                onChange={(e: { target: { value: any } }) =>
                  onPercentsChange(key, Number(e.target.value))
                }
                customClassName="settings-slider"
              />

              <FormInput
                name="percentage"
                value={inputVal.toFixed()}
                inputType="number"
                customClassName="percentage-input"
                onChange={(e: { target: { value: any } }) =>
                  onPercentsChange(key, Number(e.target.value) / 100)
                }
              />
            </div>
          );
        })}
      </div>
      {showDonut && (
        <div className="percentage-donut-container">
          <Donut
            height={isMobile ? 120 : 200}
            showTooltip={false}
            data={donutItems}
            percentage={getDonutPercentage()}
          />
        </div>
      )}
    </div>
  );
};

export default PercentsSelectors;
