var CryptoTS = require("crypto-ts");

export class CryptoHelpers {
        constructor() { }

        private jf9p3hg4n9: string = 'J*+FAL!'

        encrypt(textToEn: string): string {
                return CryptoTS.AES.encrypt(textToEn, this.jf9p3hg4n9);
        }

        decrypt(textToDe: string): string {
                var bytes = CryptoTS.AES.decrypt(textToDe.toString(), this.jf9p3hg4n9);
                return bytes.toString(CryptoTS.enc.Utf8);
        }
}


