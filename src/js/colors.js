//COLORS
let color_palette_1 = ['#EFBC69','#F1B56C','#F3A86D', '#F49A6E', '#F58D70', '#F67F71','#F77272','#F67F71']
let color_palette_2 = ['#58C2E2', '#5CB3E1', '#60A5DF', '#6596DE', '#6988DC', '#6D79DB']
let color_palette_3 = ['#171019', '#1E1621', '#251B29', '#2D2031', '#342539', '#3B2B41', '#433049', '#513A59', '#604B68','#705D77']
let color_palette_4 = ['#8C3A42', '#A3434D', '#BA4D58', '#D15663', '#E8606E', '#FF6978']
let color_palette_default = ['#FAFAFA', '#ffffff', '#FAFAFA', '#ffffff']

let palettes = [color_palette_default]
// let palettes = [color_palette_1, color_palette_2, color_palette_3, color_palette_4]

// function addColors(n){
//     let y = 0
//     let z
//     let color_palette = palettes[getRndInteger(0,palettes.length)]
//     for(let i=0; i<n; i++){
//         if(y==0){
//             z = 1
//         }
//         if(y==color_palette.length-1){
//             z = -1
//             y = y-2
//         }
//         $('.post').eq(i).css("background", color_palette[y])
//         y = y+z
//     }
// }

function addColors(n){
    for(let i=0; i<n; i=i+2){
        $('.post').eq(i).addClass('color')
    }    
}

function getRndInteger(min, max) { //min included, max excluded
    return Math.floor(Math.random() * (max - min) ) + min;
}
