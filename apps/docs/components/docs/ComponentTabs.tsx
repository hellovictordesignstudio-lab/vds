'use client';

type ComponentTabsProps = {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
};

export function ComponentTabs({ tabs, activeTab, onChange }: ComponentTabsProps) {
  return (
    <div className="component-tabs" role="tablist" aria-label="Component documentation">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`component-tabs__tab${isActive ? ' component-tabs__tab--active' : ''}`}
            onClick={() => onChange(tab)}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
