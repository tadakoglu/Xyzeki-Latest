export class CryptoHelpers {

    private cryptoPass = '-%?3*fj02'

    Encrypt(textToEn: string): string { 
        var crypto = require('crypto');

        var mykey = crypto.createCipher('aes-128-cbc', this.cryptoPass);
        var mystr = mykey.update(textToEn, 'utf8', 'hex')
        mystr += mykey.final('hex');

        return mystr;
    }



    Decrypt(textToDe: string):string {
        var crypto = require('crypto');

        var mykey = crypto.createDecipher('aes-128-cbc', this.cryptoPass);
        var mystr = mykey.update(textToDe, 'hex', 'utf8')
        mystr += mykey.final('utf8');
        
        return mystr;
    }
   
}
