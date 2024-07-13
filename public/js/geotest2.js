
const meshes = three => ({
    land: [
        new three.MeshBasicMaterial({color: 0x7cfc00, transparent: false}),
        new three.MeshBasicMaterial({color: 0x397d02, transparent: false}),
        new three.MeshBasicMaterial({color: 0x77ee00, transparent: false}),
        new three.MeshBasicMaterial({color: 0x61b329, transparent: false})],
    ocean: [new three.MeshBasicMaterial({color: 0x0f2342, transparent: false})]
})

const imageMaterialSelector = imgId => {
    const img = document.getElementById(imgId);
    const imgWidth = img.width;
    const imgHeight = img.height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = imgWidth;
    canvas.height = imgHeight;
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

    const pixelData = ctx.getImageData(0, 0, imgWidth, imgHeight);
    const pixelWidth = pixelData.width;

    return ({ lat, lon }) => {
        const x = ~~(imgWidth * (lon + 180) / 360);
        const y = ~~(imgHeight * (lat + 90) / 180);
        return pixelData.data[(y * pixelWidth + x) * 4] === 0;
    }
}


const randomMaterial = (lat, lon) => {
    return Math.random() > 0.3;
};



