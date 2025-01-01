import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-popup-comfirm',
  templateUrl: './popup-comfirm.component.html',
  styleUrls: ['./popup-comfirm.component.scss']
})
export class PopupComfirmComponent {
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit(); 
  }

  onCancel(): void {
    this.cancel.emit(); 
  }
}
