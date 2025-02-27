import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FsclientRole } from './fsclient';
import { FsclientService } from './fsclient.service';

@Component({
  selector: 'app-add-fsclient',
  templateUrl: './add-fsclient.component.html',
  styleUrls: ['./add-fsclient.component.scss']
})
export class AddFsclientComponent {

  addFsclientForm = new FormGroup({
    // We allow alphanumeric input and limit the length for name.
    name: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      // In the real world you'd want to be very careful about having
      // an upper limit like this because people can sometimes have
      // very long names. This demonstrates that it's possible, though,
      // to have maximum length limits.
      Validators.maxLength(50),
      (fc) => {
        if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
          return ({existingName: true});
        } else {
          return null;
        }
      },
    ])),

    // Since this is for a company, we need workers to be old enough to work, and probably not older than 200.
    age: new FormControl<number>(null, Validators.compose([
      Validators.required,
      Validators.min(15),
      Validators.max(200),
      // In the HTML, we set type="number" on this field. That guarantees that the value of this field is numeric,
      // but not that it's a whole number. (The fsclient could still type -27.3232, for example.) So, we also need
      // to include this pattern.
      Validators.pattern('^[0-9]+$')
    ])),

    // We don't care much about what is in the company field, so we just add it here as part of the form
    // without any particular validation.
    company: new FormControl(''),

    // We don't need a special validator just for our app here, but there is a default one for email.
    // We will require the email, though.
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.email,
    ])),

    role: new FormControl<FsclientRole>('viewer', Validators.compose([
      Validators.required,
      Validators.pattern('^(admin|editor|viewer)$'),
    ])),
  });


  // We can only display one error at a time,
  // the order the messages are defined in is the order they will display in.
  readonly addFsclientValidationMessages = {
    name: [
      {type: 'required', message: 'Name is required'},
      {type: 'minlength', message: 'Name must be at least 2 characters long'},
      {type: 'maxlength', message: 'Name cannot be more than 50 characters long'},
      {type: 'existingName', message: 'Name has already been taken'}
    ],

    age: [
      {type: 'required', message: 'Age is required'},
      {type: 'min', message: 'Age must be at least 15'},
      {type: 'max', message: 'Age may not be greater than 200'},
      {type: 'pattern', message: 'Age must be a whole number'}
    ],

    email: [
      {type: 'email', message: 'Email must be formatted properly'},
      {type: 'required', message: 'Email is required'}
    ],

    role: [
      { type: 'required', message: 'Role is required' },
      { type: 'pattern', message: 'Role must be Admin, Editor, or Viewer' },
    ]
  };

  constructor(private fsclientService: FsclientService, private snackBar: MatSnackBar, private router: Router) {
  }

  formControlHasError(controlName: string): boolean {
    return this.addFsclientForm.get(controlName).invalid &&
      (this.addFsclientForm.get(controlName).dirty || this.addFsclientForm.get(controlName).touched);
  }

  getErrorMessage(name: keyof typeof this.addFsclientValidationMessages): string {
    for(const {type, message} of this.addFsclientValidationMessages[name]) {
      if (this.addFsclientForm.get(name).hasError(type)) {
        return message;
      }
    }
    return 'Unknown error';
  }

  submitForm() {
    this.fsclientService.addFsclient(this.addFsclientForm.value).subscribe({
      next: (newId) => {
        this.snackBar.open(
          `Added fsclient ${this.addFsclientForm.value.name}`,
          null,
          { duration: 2000 }
        );
        this.router.navigate(['/fsclients/', newId]);
      },
      error: err => {
        this.snackBar.open(
          `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`,
          'OK',
          { duration: 5000 }
        );
      },
      // complete: () => console.log('Add fsclient completes!')
    });
  }

}
