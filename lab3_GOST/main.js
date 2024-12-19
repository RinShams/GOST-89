function gostEncrypt() {

    const tableOfReplacement = [
        [0x9, 0x6, 0x3, 0x2, 0x8, 0xB, 0x1, 0x7, 0xA, 0x4, 0xE, 0xF, 0xC, 0x0, 0xD, 0x5],
        [0x3, 0x7, 0xE, 0x9, 0x8, 0xA, 0xF, 0x0, 0x5, 0x2, 0x6, 0xC, 0xB, 0x4, 0xD, 0x1],
        [0xE, 0x4, 0x6, 0x2, 0xB, 0x3, 0xD, 0x8, 0xC, 0xF, 0x5, 0xA, 0x0, 0x7, 0x1, 0x9],
        [0xE, 0x7, 0xA, 0xC, 0xD, 0x1, 0x3, 0x9, 0x0, 0x2, 0xB, 0x4, 0xF, 0x8, 0x5, 0x6],
        [0xB, 0x5, 0x1, 0x9, 0x8, 0xD, 0xF, 0x0, 0xE, 0x4, 0x2, 0x3, 0xC, 0x7, 0xA, 0x6],
        [0x3, 0xA, 0xD, 0xC, 0x1, 0x2, 0x0, 0xB, 0x7, 0x5, 0x9, 0x4, 0x8, 0xF, 0xE, 0x6],
        [0x1, 0xD, 0x2, 0x9, 0x7, 0xA, 0x6, 0x0, 0x8, 0xC, 0x4, 0x5, 0xF, 0x3, 0xB, 0xE],
        [0xB, 0xA, 0xF, 0x5, 0x0, 0xC, 0xE, 0x8, 0x6, 0x2, 0x3, 0x9, 0x1, 0x7, 0xD, 0x4]
    ];

    let key = '';
    let arrOfSubKeys = [];

    function generateKeys() {
        let keyX = new Uint8Array(32);
        key = '';
        window.crypto.getRandomValues(keyX);
        for (let i = 0; i < keyX.length; i++) {
            const bits = keyX[i].toString(2).padStart(8, '0');
            for (let j = 0; j < bits.length; j++) {
                key += bits[j];
            }
        }
        arrOfSubKeys = [];
        for (let i = 0; i < 8; i++) {
            const subkey = key.slice(i * 32, (i + 1) * 32);
            arrOfSubKeys.push(subkey);
        }
    }
    
    function toEncodeText(text) {
        let text1 = text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
        let resultBinText = '';

        for (let i = 0; i < text1.length; i += 64) {
            let part = text1.slice(i, i+64);
            if (part.length < 64) {
                part = part.padStart(64, '0');
            }
            console.log(part.length)
            let leftPart = part.slice(0, 32);
            let rightPart = part.slice(32, 64);
            

            for (j = 0; j < 32; j++) {

                let oldRightPart = rightPart;
                let x = j + 1 >= 25 ? (31 - j) % 8 : j % 8;

                const num1 = parseInt(rightPart, 2);
                const num2 = parseInt(arrOfSubKeys[x], 2);
                sum = num1 + num2;
                rightPart = sum.toString(2).slice(-32).padStart(32, '0');

                let stroke = '';
                for (let k = 0; k < 8; k++) {
                    let part = parseInt(rightPart.slice(k*4, (k+1)*4), 2);
                    stroke += tableOfReplacement[k][part].toString(2).padStart(4, '0');
                }
                rightPart = stroke.slice(11) + stroke.slice(0, 11);

                let result = '';
                for (let k = 0; k < 32; k++) {
                    const bit1 = parseInt(rightPart[k], 10);
                    const bit2 = parseInt(leftPart[k], 10);
                    result += ((bit1 + bit2) % 2).toString();
                }
                leftPart = oldRightPart;
                rightPart = result;                          
            }
            resultBinText += leftPart + rightPart;
        }
        return resultBinText.match(/.{1,8}/g).map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
    }

    function toDecodeText(text) {
        let text1 = text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
        let resultBinText = '';

        for (let i = 0; i < text1.length; i += 64) {

            let part = text1.slice(i, i+64);
            if (part.length < 64) {
                console.log(x);
                part = part.padStart(64, '0');
            }
            let leftPart = part.slice(0, 32);
            let rightPart = part.slice(32, 64);            

            for (j = 0; j < 32; j++) {

                let oldLeftPart = leftPart;
                let x = j + 1 > 8 ? (31 - j) % 8 : j % 8;

                const num1 = parseInt(leftPart, 2);
                const num2 = parseInt(arrOfSubKeys[x], 2);
                sum = num1 + num2;
                leftPart = sum.toString(2).slice(-32).padStart(32, '0');

                let stroke = '';
                for (let k = 0; k < 8; k++) {
                    let part = parseInt(leftPart.slice(k*4, (k+1)*4), 2);
                    stroke += tableOfReplacement[k][part].toString(2).padStart(4, '0');
                }
                leftPart = stroke.slice(11) + stroke.slice(0, 11);

                let result = '';
                for (let k = 0; k < 32; k++) {
                    const bit1 = parseInt(leftPart[k], 10);
                    const bit2 = parseInt(rightPart[k], 10);
                    result += ((bit1 + bit2) % 2).toString(2);
                }
                rightPart = oldLeftPart;   
                leftPart = result;                    
            }
            resultBinText += (leftPart + rightPart);
        }
        return resultBinText.replace(/0+$/, '').match(/.{1,8}/g).map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
    }
    
    const encodeButton = document.querySelector('#encodeButton');
    const decodeButton = document.querySelector('#decodeButton');
    const hackingButton = document.querySelector('#hackingButton');
    
    const areaOfOrigText = document.querySelector('#originalText');
    const areaOfResultText = document.querySelector('#resultText');
    
    encodeButton.addEventListener('click', () => {
        var origText = areaOfOrigText.value;
        if(origText) {
            generateKeys();
            const resultText = toEncodeText(origText);
            areaOfResultText.innerHTML = '';
            areaOfResultText.innerHTML = resultText;
        }
    });
    
    decodeButton.addEventListener('click', () => {
        var text = areaOfOrigText.value;
        if(text && key[1]) {
            const resultText = toDecodeText(text);
            areaOfResultText.innerHTML = '';
            areaOfResultText.innerHTML = resultText;
        }
    });
    
    generateKeys();
}

gostEncrypt();
