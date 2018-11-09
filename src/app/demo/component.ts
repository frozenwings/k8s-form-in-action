import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { safeDump, safeLoadAll } from 'js-yaml';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'x-demo',
  templateUrl: './template.html',
  styleUrls: ['./style.css'],
})
export class DemoComponent implements OnInit {
  form: FormGroup;
  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      ui: [],
      yaml: [],
    });

    const uiCtrl = this.form.get('ui');
    const yamlCtrl = this.form.get('yaml');

    uiCtrl.valueChanges.pipe(startWith(uiCtrl.value)).subscribe(value => {
      yamlCtrl.setValue(this.formToYaml(value), { emitEvent: false });
    });

    yamlCtrl.valueChanges.pipe(startWith(yamlCtrl.value)).subscribe(value => {
      uiCtrl.setValue(this.yamlToForm(value), { emitEvent: false });
    });

    this.http
      .get('assets/deployment.yaml', {
        responseType: 'text',
      })
      .subscribe((deployment: string) => {
        yamlCtrl.setValue(deployment);
      });
  }

  private yamlToForm(yaml: string) {
    const formModels = safeLoadAll(yaml).map(item =>
      item === 'undefined' ? undefined : item,
    );
    let formModel = formModels[0];

    // For now we can only process a single deployment resource in the yaml.
    if (formModels.length > 1) {
      console.log('Can only convert a single resource at the moment');
    }

    if (!formModel || formModel instanceof String) {
      formModel = {};
    }

    return formModel;
  }

  private formToYaml(json: any) {
    try {
      // Following line is to remove undefined values
      json = JSON.parse(JSON.stringify(json));
      return safeDump(json);
    } catch (err) {
      console.log(err);
    }
  }
}
