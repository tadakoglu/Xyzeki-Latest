var CryptoTS = require("crypto-ts");

export class CryptoHelpers {
        constructor() { }

        private jf9p3hg4n9: string = 'J*+FAL!%54?6g'


        encrypt(textToEn: string): string {
                return CryptoTS.AES.encrypt(textToEn, this.jf9p3hg4n9);
        }

        decrypt(textToDe: string): string {
                var bytes = CryptoTS.AES.decrypt(textToDe.toString(), this.jf9p3hg4n9);
                return bytes.toString(CryptoTS.enc.Utf8);
        }
        randomNumber(base = 10): number {
                return Math.floor(Math.random() * base)
        }



        RandomGuid(parts: number = 4): string {
                const stringArr = [];
                for (let i = 0; i < parts; i++) {
                        // tslint:disable-next-line:no-bitwise
                        const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                        stringArr.push(S4);
                }
                return stringArr.join('-');
        }

}


