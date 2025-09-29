// modal-host.component.ts
import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal-host',
  templateUrl: './modal-host.component.html',
})
export class ModalHostComponent implements AfterViewInit {
  @ViewChild('modalHost', { read: ViewContainerRef }) vcr!: ViewContainerRef;

  constructor(private modalService: ModalService) {}

  ngAfterViewInit() {
    this.modalService.registerHost(this.vcr);
  }
}
