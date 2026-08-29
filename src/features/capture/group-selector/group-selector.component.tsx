import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';
import clsx from 'clsx';

import { Category } from '@api/types';
import { EXPENSE_GROUP_OPTIONS, ResolvedExpenseGroupOption } from '@shared/utils';
import { TTIcon } from '@shared/ui';

import './group-selector.styles.scss';

interface GroupSelectorProps {
  groups: ResolvedExpenseGroupOption[];
  groupedOptions: typeof EXPENSE_GROUP_OPTIONS;
  selectedValue: string;
  search: string;
  onSearch: (value: string) => void;
  onSelect: (group: ResolvedExpenseGroupOption) => void;
}

const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  groupedOptions,
  selectedValue,
  search,
  onSearch,
  onSelect,
}) => {
  const { t } = useTranslation(['budget', 'taxonomy']);
  const tt = (key: string, options?: any) => t(key, options) as unknown as string;
  const visible = new Set(groups.map((group) => group.value));

  return (
    <section className="capture-body capture-selector-view">
      <label className="capture-search" htmlFor="capture-group-search">
        <TTIcon icon={FiSearch} color="var(--color-text-muted)" size={18} />
        <input
          id="capture-group-search"
          type="search"
          value={search}
          placeholder={tt('budget:capture.searchGroups')}
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>

      {(Object.entries(groupedOptions) as Array<[Category, ResolvedExpenseGroupOption[]]>).map(
        ([category, options]) => {
          const filtered = options
            .map((option) => ({ ...option, category }))
            .filter((option) => visible.has(option.value));

          if (filtered.length === 0) return null;

          return (
            <section className="capture-group-list" key={category}>
              <h2>{t(`taxonomy:categoryNames.${category}`)}</h2>
              {filtered.map((group) => (
                <button
                  type="button"
                  key={group.value}
                  className={clsx('capture-group-option', {
                    'capture-group-option--selected': selectedValue === group.value,
                  })}
                  onClick={() => onSelect(group)}
                >
                  <span className="capture-group-option-icon">
                    <TTIcon icon={group.icon} color={group.color} size={20} />
                  </span>
                  <span>
                    <strong>{t(group.i18nLabel)}</strong>
                    <small>{t(`taxonomy:categoryNames.${category}`)}</small>
                  </span>
                </button>
              ))}
            </section>
          );
        },
      )}
    </section>
  );
};

export default GroupSelector;
