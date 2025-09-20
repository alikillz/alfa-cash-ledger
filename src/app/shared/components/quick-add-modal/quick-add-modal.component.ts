import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-quick-add-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Add New {{ title }}</h2>
          <button class="close-btn" (click)="onClose()">×</button>
        </div>

        <form [formGroup]="addForm" (ngSubmit)="onSubmit()" class="add-form">
          <div class="form-group">
            <label [for]="fieldName">{{ title }} Name *</label>
            <input
              [id]="fieldName"
              type="text"
              [formControlName]="fieldName"
              [placeholder]="'Enter ' + title.toLowerCase() + ' name'"
              [class.error]="addForm.get(fieldName)?.invalid && addForm.get(fieldName)?.touched"
            />
            @if (addForm.get(fieldName)?.invalid && addForm.get(fieldName)?.touched) {
            <div class="error-message">Name is required</div>
            }
          </div>

          <div class="form-actions">
            <button type="button" (click)="onClose()" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="addForm.invalid">
              Add {{ title }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
      }

      .modal-content {
        background: white;
        border-radius: 12px;
        width: 100%;
        max-width: 400px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-header h2 {
        margin: 0;
        color: #2d3748;
        font-size: 1.5rem;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #718096;
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .add-form {
        padding: 1.5rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #4a5568;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        font-size: 1rem;
        transition: border-color 0.2s;
      }

      input:focus {
        outline: none;
        border-color: #4299e1;
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
      }

      input.error {
        border-color: #e53e3e;
      }

      .error-message {
        color: #e53e3e;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e2e8f0;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }

      .btn-primary {
        background: #38a169;
        color: white;
      }

      .btn-secondary {
        background: #e2e8f0;
        color: #4a5568;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class QuickAddModalComponent {
  private fb = inject(FormBuilder);

  @Input() title: string = '';
  @Input() fieldName: string = '';
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  addForm = this.fb.group({
    name: ['', Validators.required],
  });

  get fieldControl() {
    return this.addForm.get('name');
  }

  onClose(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.addForm.valid) {
      this.saved.emit(this.addForm.value.name!);
      this.addForm.reset();
      this.onClose();
    }
  }
}
