import { Component, OnInit } from '@angular/core';
import { LAYOUT_VERTICAL } from './layout.model';

/** Layout principal : barre laterale (vertical) + topbar + contenu. */
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  ngOnInit(): void {
    document.body.setAttribute('layout', LAYOUT_VERTICAL);
  }
}
