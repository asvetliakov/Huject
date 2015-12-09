"use strict";

export class DeepService {
    private sayString: string = "I'm Deep Service, i have default say string";

    public constructor(sayString: string) {
        this.sayString = sayString;
    }

    public deepSay(): string {
        return this.sayString;
    }
}