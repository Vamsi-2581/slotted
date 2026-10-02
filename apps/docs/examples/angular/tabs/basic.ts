import { Component } from '@angular/core';
import { SlTab, SlTabList, SlTabPanel, SlTabs } from '@slotted/angular/tabs';

@Component({
  selector: 'app-tabs-basic',
  imports: [SlTab, SlTabList, SlTabPanel, SlTabs],
  template: `
    <div slTabs defaultValue="summary">
      <div slTabList aria-label="Order">
        <div slTab value="summary">Summary</div>
        <div slTab value="items">Items</div>
      </div>
      <div slTabPanel value="summary">Delivery expected on September 12.</div>
      <div slTabPanel value="items">Three items.</div>
    </div>
  `,
})
export class TabsBasic {}
