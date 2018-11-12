import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  forwardRef,
} from '@angular/core';
import { FormArray, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  BaseResourceFormGroupComponent,
  PathParam,
} from 'ng-resource-form-util';

import { PodSpec } from '../types';

@Component({
  selector: 'x-pod-spec-form',
  templateUrl: './template.html',
  styleUrls: ['./style.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PodSpecFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PodSpecFormComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PodSpecFormComponent extends BaseResourceFormGroupComponent<
  PodSpec
> {
  constructor(injector: Injector) {
    super(injector);
  }

  createForm() {
    return this.fb.group({
      containers: this.fb.array([]),
    });
  }

  pullSecretTrackFn(secret: { name: string }) {
    return secret.name;
  }

  adaptResourceModel(resource: PodSpec) {
    // Makes sure user will not accidently remove the last container:
    if (resource && !resource.containers) {
      resource = { ...resource, containers: [{ name: '', image: '' }] };
    }
    return resource;
  }

  getDefaultFormModel(): PodSpec {
    return {
      containers: [{ name: '', image: '' }],
      volumes: [] as any,
    };
  }

  addContainer() {
    this.containersForm.push(this.getNewContainerFormControl());
    this.cdr.markForCheck();
  }

  removeContainer(index: number) {
    this.containersForm.removeAt(index);
  }

  getOnFormArrayResizeFn() {
    return (path: PathParam) => this.getNewContainerFormControl(path);
  }

  getNewContainerFormControl(path?: PathParam) {
    let index = this.containersForm.length;
    if (path) {
      index = +path[path.length - 1];
    }
    return this.fb.control({ name: `container-${index}`, image: '' });
  }

  get containersForm(): FormArray {
    return this.form.get('containers') as FormArray;
  }

  get volumesForm(): FormArray {
    return this.form.get('volumes') as FormArray;
  }

  trackByFn(index: number) {
    return index;
  }
}
