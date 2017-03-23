import {Observable} from "rxjs/Observable";

export interface AppTabData {
    dataSource: "local" | "public" | "app";
    parsedContent: any;
    fileContent: string;
    isWritable: boolean;
    resolve: (content: string) => Observable<string>;
    language: "json" | "yaml" | string,

}
