import {
    Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, Output, EventEmitter,
    SimpleChanges
} from "@angular/core";
import {CommandLineToolModel} from "cwlts/models";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {ModalService} from "../../../ui/modal/modal.service";
import {Subscription} from "rxjs/Subscription";
import {SystemService} from "../../../platform-providers/system.service";

@Component({
    selector: "ct-hints",
    template: `
        <ct-form-panel>
            <div class="tc-header">Hints</div>

            <div class="tc-body">

                <!--Blank Tool Screen-->
                <ct-blank-tool-state *ngIf="!readonly && !model.hints.length" 
                                     [buttonText]="'Add a Hint'"
                                     [learnMoreURL]="'http://docs.sevenbridges.com/docs/list-of-execution-hints'"
                                     (buttonClick)="addEntry()">
                    
                    Execution hints and their values, which specify execution requirements and suggestions, for example, the AWS instance
                    type to use.
                </ct-blank-tool-state>

                <div *ngIf="readonly && !model.hints.length" class="text-xs-center h5">
                    This tool doesn't specify any hints
                </div>

                <!--List Header Row-->
                <div class="editor-list-title" *ngIf="!!model.hints.length">
                    <div class="col-xs-6">
                        Class
                    </div>
                    <div class="col-xs-6">
                        Value
                    </div>
                </div>

                <form [formGroup]="form" *ngIf="form">
                    <ul class="editor-list" formArrayName="hints">
                        <li *ngFor="let control of form.controls['hints'].controls; let i = index">
                            <div class="flex-row">
                                <ct-requirement-input [formControl]="control"
                                                      [context]="context"
                                                      class="mr-1"
                                                      [formControlName]="i"
                                                      [classSuggest]="classSuggest"
                                                      [readonly]="readonly">
                                </ct-requirement-input>

                                <!--Actions Column-->
                                <div *ngIf="!readonly" class="mr-1 mb-1">
                                    <i [ct-tooltip]="'Delete'"
                                       class="fa fa-trash text-hover-danger clickable"
                                       (click)="removeEntry(i)"></i>
                                </div>
                            </div>
                        </li>
                    </ul>
                </form>

                <!--Add entry link-->
                <button *ngIf="!readonly && !!model.hints.length"
                        (click)="addEntry()"
                        type="button"
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> Add a Hint
                </button>
            </div>
        </ct-form-panel>
    `,
    styleUrls: ["./hints.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HintsComponent implements OnChanges {

    @Input()
    model: CommandLineToolModel;

    @Input()
    classSuggest: string[];

    @Input()
    readonly = false;

    @Input()
    context: any;

    form: FormGroup;

    @Output()
    update = new EventEmitter();

    private sub: Subscription;

    constructor(private modal: ModalService, public system: SystemService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        const model = this.model;

        if (!this.form) {
            this.form = new FormGroup({});
        }

        if (model.hints) {
            if (this.sub) {
                this.sub.unsubscribe();
            }

            this.form.setControl("hints", new FormArray([]));

            model.hints.forEach(h => {
                (this.form.get("hints") as FormArray)
                    .push(new FormControl({value: h, disabled: this.readonly}));
            });

            this.sub = this.form.valueChanges.subscribe(form => {
                this.update.emit(this.model.hints);
            });
        }
    }

    removeEntry(i: number) {
        this.modal.delete("hint").then(() => {
            this.model.hints.splice(i, 1);
            (this.form.get("hints") as FormArray).removeAt(i);
            this.update.emit(this.model.hints);
        }, err => {
            console.warn(err);
        });
    }

    addEntry() {
        const hint = this.model.addHint({class: "", value: ""});
        (this.form.get("hints") as FormArray).push(new FormControl({
            value: hint,
            disabled: this.readonly
        }));
        this.update.emit(this.model.hints);
    }
}
