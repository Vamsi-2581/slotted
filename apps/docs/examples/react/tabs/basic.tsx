import { Tab, TabList, TabPanel, Tabs } from '@slotted/react';

export default function TabsBasic() {
  return (
    <Tabs defaultValue="summary">
      <TabList aria-label="Order">
        <Tab value="summary">Summary</Tab>
        <Tab value="items">Items</Tab>
      </TabList>
      <TabPanel value="summary">Delivery expected on September 12.</TabPanel>
      <TabPanel value="items">Three items.</TabPanel>
    </Tabs>
  );
}
