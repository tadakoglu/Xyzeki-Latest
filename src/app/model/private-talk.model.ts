export class PrivateTalk {
    constructor(
        public Sender: string,
        public Thread:string,
        public DateTimeCreated: string, // that could be changed with a better option
        public PrivateTalkId: number = 0,

    ) { }

}