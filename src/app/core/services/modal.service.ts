// modal.service.ts
import { ComponentRef, Injectable, Type, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private vcr?: ViewContainerRef;

  registerHost(vcr: ViewContainerRef) {
    this.vcr = vcr;
  }

  open<T extends object>(
    component: Type<T>,
    inputs?: Partial<T>
  ): { ref: ComponentRef<T>; closed$: Subject<any> } {
    if (!this.vcr) throw new Error('No modal host registered!');

    this.vcr.clear();
    const ref = this.vcr.createComponent(component);

    if (inputs) Object.assign(ref.instance, inputs);

    const closed$ = new Subject<any>();
    (ref.instance as any).closed?.subscribe((value: any) => {
      closed$.next(value);
      closed$.complete();
      ref.destroy();
    });

    return { ref, closed$ };
  }
}
