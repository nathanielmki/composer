import {Component, Input, OnInit, OnDestroy} from "@angular/core";
import {
    Validators,
    FormBuilder,
    FormGroup,
    FormControl,
    REACTIVE_FORM_DIRECTIVES,
    FORM_DIRECTIVES
} from "@angular/forms";
import {ExpressionInputComponent, ExpressionInputType} from "../types/expression-input.component";
import {EventHubService} from "../../../../services/event-hub/event-hub.service";
import {UpdateBaseCommandExpression} from "../../../../action-events/index";
import {Subscription} from "rxjs/Subscription";

require("./base-command-form.components.scss");

@Component({
    selector: 'base-command-form',
    directives: [
        ExpressionInputComponent,
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
             <form [formGroup]="baseCommandForm">
                <fieldset class="form-group">
                      <button type="button" class="btn btn-secondary hide-btn">Hide</button>
               
                        <label>Base Command</label>
                        <label class="secondary-label">What command do you want to call from the image</label>
                        
                        <expression-input [inputControl]="baseCommandForm.controls['baseCommand']"
                                          [expressionType]="expressionInputType">
                        </expression-input>
                        
                    <button type="button" class="btn btn-secondary add-input-btn">Add base command</button>
                </fieldset>
             </form>
    `
})
export class BaseCommandFormComponent implements OnInit, OnDestroy {
    @Input()
    public baseCommand: string;

    /** The parent forms group */
    @Input()
    public group: FormGroup;

    private baseCommandForm: FormGroup;

    private expressionInputType: ExpressionInputType = "baseCommand";

    private subs: Subscription[];

    constructor(private formBuilder: FormBuilder,
                private eventHubService: EventHubService) {

        this.subs = [];
    }

    ngOnInit(): void {
        this.baseCommandForm = this.formBuilder.group({
            baseCommand: [this.baseCommand, Validators.compose([Validators.required, Validators.minLength(1)])]
        });

        let baseCommandValueChanges = this.baseCommandForm.controls['baseCommand'].valueChanges.subscribe(value => {
            this.baseCommand = value;
        });

        this.group.addControl('baseCommand', this.baseCommandForm.controls['baseCommand']);

        let updateBaseCommandExpression = this.eventHubService.onValueFrom(UpdateBaseCommandExpression)
            .subscribe((expression: string) => {
                const baseCommandControl: FormControl = <FormControl>this.baseCommandForm.controls['baseCommand'];

                //TODO: update the actual model
                baseCommandControl.updateValue(expression);
            });

        this.subs.push(baseCommandValueChanges);
        this.subs.push(updateBaseCommandExpression);
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}