import NavigationTabs, { TabItem } from "./NavigationTabs";

interface BudgetTabsProps {
  basePath?: string;
}

export default function BudgetTabs({
  basePath = "/platform/budget",
}: BudgetTabsProps) {
  const tabs: TabItem[] = [
    { label: "Presupuesto", path: basePath },
    { label: "Progreso", path: `${basePath}/progress` },
  ];

  return <NavigationTabs tabs={tabs} />;
}
