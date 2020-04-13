const emfn = require('../BUILD/EMFN')

const n = new emfn.Notion("561103748a1dd37136212e4884f3a8075fec7d5fb265701c7a16226f9247f2726a88601201ff15a4c800bc8f84d07da3da420159f417abcacba741e51cfc50b9905e154e133f83f52e6ba9e83a4b",
                          "51eca4df-05b9-4167-92ad-a90e229aaafe")

n.CreatPage("5", "009a6559-cbcf-4657-8a55-7f5dafb03704", "🕴️", {img: "https://img2.gratispng.com/20180621/ewt/kisspng-trello-logo-slack-atlassian-trello-5b2bcdc85e4d36.2783338815295973843863.jpg", pos: 0.5})
.then(r => {

    console.log(r)

})
