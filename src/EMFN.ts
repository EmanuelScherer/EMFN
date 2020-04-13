/**
 * @module EMFN
 * 
 * @author Emanuel de Souza Scherer
 * 
 * @requires axios^0.19.2
 * @requires uuid^7.0.3
 * @requires acorn>=5.7.4
 * 
*/

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Passa uma string para o formato de UUID
 * 
 * @returns A string no formato UUID, se a string ja estivar em UUID apenas retorna ela
 * 
 * @param str - String a ser passada para UUID
 */
export const StringToUUID = (str: string) => {

    if (!str.match("\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}")) {

        return str.slice(0, 8) + "-" + str.slice(8, 12) + "-" + str.slice(12, 16) + "-" + str.slice(16, 20) + "-" + str.slice(20, 32)

    }
    else {

        return str

    }

}

export class Notion {

    token: string
    user: string

    auth: {}

    /**
     * Define uma conta para modificar documentos no Notion
     * 
     * @param token - O token de autorização do Notion (Pode ser pego nos cookies da internet no www.notion.so -> token_v2) 
     * @param user - O id do usario (Pode ser pego nos cookies da internet no www.notion.so -> notion_user_id)
     */
    constructor(token: string, user: string) {

        this.token = token
        this.user = user

        this.auth = {headers: {Cookie: "token_v2="+token}}

    }

    /**
     * Pega uma pagina do Notion (no formato de JSON)
     * 
     * @returns O id da nova pagina
     * 
     * @param id - Id da pagina a ser pega -> fica no url da pagina depois do - (traço) (pode ser colocado no modo UUID ou não - de preferencia no UUID)
     *
     * @example
     * <caption>Exemplo de uso (Os IDS são meramente ilustrativos)</caption>
     * 
     * const notion = new Notion("auydgasudr651324g763t473274g32bgdhuagds8ygduyasgd8s7t65746235467234gbjbsjhbfauybaisnudbuasygduiashd78364yh3b2ino0r9fh9d78yvgybuehuirj7342837t4hjdfgbuyst3yhn",
     * "453hmkyo-2736-4167-so4b-a90e229aaafe")
     *
     * notion.GetPage("ng703jp4-65c7-4c07-9e8c-5d1973ad79de")
     * .then(r => {
     * 
     *      //SEU CODIGO -> r é a resposta JSON
     * 
     * })
     *  
     */
    GetPage = (id: string) => {

        return new Promise<Object>(resolve => {

            id = StringToUUID(id)

            const body = {

                    "pageId": id,
                    "limit": 50,
                    "cursor": {
                        "stack": [
                            [
                                {
                                    "table": "block",
                                    "id": id,
                                    "index": 0
                                }
                            ]
                        ]
                    },
                    "chunkNumber": 0,
                    "verticalColumns": false

            }

            axios.post("https://www.notion.so/api/v3/loadPageChunk", body, this.auth)
            .then(r => {

                resolve(r.data)
                return r.data

            })

        })
    }

    /**
     * Cria uma nova pagina
     * 
     * @param name - Nome que deseja dar para a nova pagina
     * @param workspace - Workspace da documentação
     * @param icon - Icone (um emoji -> pode ser achado aki -> https://emojipedia.org/)
     * @param cover - Cover 
     * @param cover.img - O link de uma imagem para ser o cover
     * @param cover.pos - posição da imagem dentro da area do cover (0.1 - 1)
     * 
     * @example
     * <caption>Exemplo de uso (Os IDS são meramente ilustrativos)</caption>
     * 
     * const notion = new Notion("auydgasudr651324g763t473274g32bgdhuagds8ygduyasgd8s7t65746235467234gbjbsjhbfauybaisnudbuasygduiashd78364yh3b2ino0r9fh9d78yvgybuehuirj7342837t4hjdfgbuyst3yhn",
     * "453hmkyo-2736-4167-so4b-a90e229aaafe")
     *
     * notion.CreatPage("Pagina Nova", "89nko2pk-alvy-7nhf-so4b-8hm90hf47n2k", "🕴️", {img: "https://img2.gratispng.com/20180621/ewt/kisspng-trello-logo-slack-atlassian-trello-5b2bcdc85e4d36.2783338815295973843863.jpg", pos: 0.5})
     * .then(r => {
     * 
     *      //SEU CODIGO -> r é a resposta JSON (id: "ID da nova pagina no modo UUID")
     * 
     * })
     */
    CreatPage = (name: string, workspace: string, icon: string, cover: {img: string, pos: number}) => {

        return new Promise<Object>(resolve => {

            const id = uuidv4()

            const body = {

                "requestId": "Criando a pagina "+name,
                "transactions": [
                    {
                        "id": name,
                        "shardId": 14084,
                        "operations": [
                            {
                                "id": id,
                                "table": "block",
                                "path": [],
                                "command": "set",
                                "args": {
                                    "type": "page",
                                    "id": id,
                                    "version": 1
                                }
                            },
                            {
                                "id": id,
                                "table": "block",
                                "path": [],
                                "command": "update",
                                "args": {
                                    "parent_id": workspace,
                                    "parent_table": "space",
                                    "alive": true
                                }
                            },
                            {
                                "table": "space",
                                "id": workspace,
                                "path": [
                                    "pages"
                                ],
                                "command": "listAfter",
                                "args": {
                                    "id": id
                                }
                            },
                            {
                                "id": id,
                                "table": "block",
                                "path": [],
                                "command": "update",
                                "args": {
                                    "permissions": [
                                        {
                                            "type": "user_permission",
                                            "user_id": this.user,
                                            "role": "editor"
                                        }
                                    ]
                                }
                            },
                            {
                                "id": id,
                                "table": "block",
                                "path": [
                                    "properties",
                                    "title"
                                ],
                                "command": "set",
                                "args": [
                                    [
                                        name
                                    ]
                                ]
                            }
                        ]
                    }
                ]
            }

            axios.post("https://www.notion.so/api/v3/submitTransaction", body, this.auth)
            .then(r => {

                const page = new Page(this, id)

                page.ChangeIcon(icon).then(r => {

                    page.ChangeCover(cover.img, cover.pos).then(r => {

                        resolve({id: id, icon: icon, cover: cover})

                    })

                })

            })
            .catch(r => console.log(r))

        })

    }

    /**
     * Deleta uma pagina
     * 
     * @returns True se tudo certo, Object se deu erro
     * 
     * @param id - ID da pagina a ser deletada
     * 
     * @example
     * <caption>Exemplo de uso (Os IDS são meramente ilustrativos)</caption>
     * 
     * const notion = new Notion("auydgasudr651324g763t473274g32bgdhuagds8ygduyasgd8s7t65746235467234gbjbsjhbfauybaisnudbuasygduiashd78364yh3b2ino0r9fh9d78yvgybuehuirj7342837t4hjdfgbuyst3yhn",
     * "453hmkyo-2736-4167-so4b-a90e229aaafe")
     *
     * notion.DeletePage("89nko2pk-alvy-7nhf-so4b-8hm90hf47n2k")
     * .then(r => {
     * 
     *      //SEU CODIGO -> r é a resposta (true)
     * 
     * })
     */
    DeletePage = (id: string) => {

        return new Promise<object | boolean>(resolve => {

            id = StringToUUID(id)

            const body = {

                "blockIds": [
                    id
                ],

                "permanentlyDelete": true
            }

            axios.post("https://www.notion.so/api/v3/deleteBlocks", body, this.auth)
            .then(r => {

                resolve(true)
                return(true)

            })
            .catch(e => {

                resolve(e)
                return(e)
                
            })

        })

    }

}

export class Page {

    notion: Notion
    id: string

    /**
     * Cria uma novo objeto referente a uma pagina no Notion
     * 
     * @param notion - Objeto da conta no notion (Objeto gerado pela classe Notion)
     * @param id - ID da pagina (no modo UUID ou não - de preferencia no UUDI)
     */
    constructor (notion: Notion, id: string) {

        this.notion = notion
        this.id = StringToUUID(id)

    }

    /**
     * Retorna a pagina no formato JSON (Igual Notion.GetPage())
     * 
     * @returns A pagina no formato JSON (Igual Notion.GetPage())
     * 
     * @example
     * <caption>Exemplo de uso (Os IDS são meramente ilustrativos)</caption>
     * 
     * const notion = new Notion("auydgasudr651324g763t473274g32bgdhuagds8ygduyasgd8s7t65746235467234gbjbsjhbfauybaisnudbuasygduiashd78364yh3b2ino0r9fh9d78yvgybuehuirj7342837t4hjdfgbuyst3yhn",
     * "453hmkyo-2736-4167-so4b-a90e229aaafe")
     *
     * const page = new Page(notion, "ng703jp4-65c7-4c07-9e8c-5d1973ad79de")
     * 
     * page.Get()
     * .then(r => {
     * 
     *      //SEU CODIGO -> r é a resposta JSON
     * 
     * })
     */
    Get = () => {

        return new Promise(resolve => {

            resolve(this.notion.GetPage(this.id))

        })

    }

    /**
     * Cria um texto na pagina
     * 
     * @returns Se deu certo retorna {id: "UUID DO TEXTO"}, Object se deu errado
     * 
     * @example
     * <caption>Exemplo de uso (Os IDS são meramente ilustrativos)</caption>
     * 
     * const notion = new Notion("auydgasudr651324g763t473274g32bgdhuagds8ygduyasgd8s7t65746235467234gbjbsjhbfauybaisnudbuasygduiashd78364yh3b2ino0r9fh9d78yvgybuehuirj7342837t4hjdfgbuyst3yhn",
     * "453hmkyo-2736-4167-so4b-a90e229aaafe")
     *
     * const page = new Page(notion, "ng703jp4-65c7-4c07-9e8c-5d1973ad79de")
     * 
     * page.CreateText("Eae blz?")
     * .then(r => {
     * 
     *      //SEU CODIGO -> r é a resposta
     * 
     * })
     */
    CreateText = (text: string) => {

        return new Promise<Object | {id: string}>(resolve => {

            const id = uuidv4()

            const body = {

                "requestId": "Criando texto",
                "transactions": [
                    {
                        "id": "Criando o texto "+id,
                        "shardId": 14084,
                        "operations": [
                            {
                                "id": id,
                                "table": "block",
                                "path": [],
                                "command": "set",
                                "args": {
                                    "type": "text",
                                    "id": id,
                                    "version": 1
                                }
                            },
                            {
                                "id": id,
                                "table": "block",
                                "path": [],
                                "command": "update",
                                "args": {
                                    "parent_id": this.id,
                                    "parent_table": "block",
                                    "alive": true
                                }
                            },
                            {
                                "table": "block",
                                "id": this.id,
                                "path": [
                                    "content"
                                ],
                                "command": "listAfter",
                                "args": {
                                    "id": id
                                }
                            },
                            {
                                "id": id,
                                "table": "block",
                                "path": [
                                    "properties",
                                    "title"
                                ],
                                "command": "set",
                                "args": [
                                    [
                                        text
                                    ]
                                ]
                            }
                        ]
                    }
                ]
            }

            axios.post("https://www.notion.so/api/v3/submitTransaction", body, this.notion.auth)
            .then(r => {

                resolve({id: id})

            })
            .catch(e => {

                resolve(e)

            })

        })

    }

    /**
     * Deleta um objeto da pagina
     * 
     * @returns True se tudo certo, Object se deu erro
     * 
     * @param id - ID do obejeto a ser deletado
     * 
     * @example
     * <caption>Exemplo de uso (Os IDS são meramente ilustrativos)</caption>
     * 
     * const notion = new Notion("auydgasudr651324g763t473274g32bgdhuagds8ygduyasgd8s7t65746235467234gbjbsjhbfauybaisnudbuasygduiashd78364yh3b2ino0r9fh9d78yvgybuehuirj7342837t4hjdfgbuyst3yhn",
     * "453hmkyo-2736-4167-so4b-a90e229aaafe")
     *
     * const page = new Page(notion, "ng703jp4-65c7-4c07-9e8c-5d1973ad79de")
     * 
     * page.DeleteObject("89nko2pk-alvy-7nhf-so4b-8hm90hf47n2k")
     * .then(r => {
     * 
     *      //SEU CODIGO -> r é a resposta (true)
     * 
     * })
     */
    DeleteObject = (id: string) => {

        return new Promise<object | boolean>(resolve => {

            id = StringToUUID(id)

            const body = {

                "blockIds": [
                    id
                ],

                "permanentlyDelete": true
            }

            axios.post("https://www.notion.so/api/v3/deleteBlocks", body, this.notion.auth)
            .then(r => {

                resolve(true)

            })
            .catch(e => {

                resolve(e)
                
            })

        })

    }

    /**
     * Modifica um texto na pagina
     * 
     * @returns True se deu certo, Object se deu errado
     * 
     * @param id - Id do texto dentro da pagina a ser editado
     * @param newText - Novo texto
     * 
     * @example
     * <caption>Exemplo de uso (Os IDS são meramente ilustrativos)</caption>
     * 
     * const notion = new Notion("auydgasudr651324g763t473274g32bgdhuagds8ygduyasgd8s7t65746235467234gbjbsjhbfauybaisnudbuasygduiashd78364yh3b2ino0r9fh9d78yvgybuehuirj7342837t4hjdfgbuyst3yhn",
     * "453hmkyo-2736-4167-so4b-a90e229aaafe")
     *
     * const page = new Page(notion, "ng703jp4-65c7-4c07-9e8c-5d1973ad79de")
     * 
     * page.ChangeText("89nko2pk-alvy-7nhf-so4b-8hm90hf47n2k", "Blz?")
     * .then(r => {
     * 
     *      //SEU CODIGO -> r é a resposta (true)
     * 
     * })
     */
    ChangeText = (id: string, newText: string) => {

        return new Promise<boolean | object>(resolve => {

            const body = {

                "requestId": "Editando o Texto",
                "transactions": [
                    {
                        "id": "Editando o Texto"+id,
                        "shardId": 14084,
                        "operations": [
                            {
                                "id": id,
                                "table": "block",
                                "path": [
                                    "properties",
                                    "title"
                                ],
                                "command": "set",
                                "args": [
                                    [
                                        newText
                                    ]
                                ]
                            }
                        ]
                    }
                ]
            }

            axios.post("https://www.notion.so/api/v3/submitTransaction", body, this.notion.auth)
            .then(r => {

                resolve(true)

            })
            .catch(e => {

                resolve(e)

            })

        })

    }

    /**
     * Modifica o titulo da pagina
     * 
     * @returns True se deu certo, Object se deu errado
     * 
     * @param newTitle - Novo titulo
     * 
     * @example
     * <caption>Exemplo de uso (Os IDS são meramente ilustrativos)</caption>
     * 
     * const notion = new Notion("auydgasudr651324g763t473274g32bgdhuagds8ygduyasgd8s7t65746235467234gbjbsjhbfauybaisnudbuasygduiashd78364yh3b2ino0r9fh9d78yvgybuehuirj7342837t4hjdfgbuyst3yhn",
     * "453hmkyo-2736-4167-so4b-a90e229aaafe")
     *
     * const page = new Page(notion, "ng703jp4-65c7-4c07-9e8c-5d1973ad79de")
     * 
     * page.ChangeTitle("Blz?")
     * .then(r => {
     * 
     *      //SEU CODIGO -> r é a resposta (true)
     * 
     * })
     */
    ChangeTitle = (newTitle: string) => {

        return new Promise<boolean | object>(resolve => {

            const body = {

                "requestId": "Editando o Texto",
                "transactions": [
                    {
                        "id": "Editando o Texto"+this.id,
                        "shardId": 14084,
                        "operations": [
                            {
                                "id": this.id,
                                "table": "block",
                                "path": [
                                    "properties",
                                    "title"
                                ],
                                "command": "set",
                                "args": [
                                    [
                                        newTitle
                                    ]
                                ]
                            }
                        ]
                    }
                ]
            }

            axios.post("https://www.notion.so/api/v3/submitTransaction", body, this.notion.auth)
            .then(r => {

                resolve(true)

            })
            .catch(e => {

                resolve(e)

            })

        })

    }

    /**
     * Troca o Icone da pagina
     * 
     * @returns True se deu certo, Object se deu errado
     * 
     * @param icon - Novo icone (um emoji -> pode ser achado aki -> https://emojipedia.org/)
     * 
     * @example
     * <caption>Exemplo de uso (Os IDS são meramente ilustrativos)</caption>
     * 
     * const notion = new Notion("auydgasudr651324g763t473274g32bgdhuagds8ygduyasgd8s7t65746235467234gbjbsjhbfauybaisnudbuasygduiashd78364yh3b2ino0r9fh9d78yvgybuehuirj7342837t4hjdfgbuyst3yhn",
     * "453hmkyo-2736-4167-so4b-a90e229aaafe")
     *
     * const page = new Page(notion, "ng703jp4-65c7-4c07-9e8c-5d1973ad79de")
     * 
     * page.ChangeIcon("😀")
     * .then(r => {
     * 
     *      //SEU CODIGO -> r é a resposta (true)
     * 
     * })
     */
    ChangeIcon = (newIcon: string) => {

        return new Promise<boolean | object>(resolve => {

            const body = {

                "requestId": "Editando Icone da pagina "+this.id,
                "transactions": [
                    {
                        "id": "Editando Icone da pagina "+this.id,
                        "shardId": 14084,
                        "operations": [
                            {
                                "id": this.id,
                                "table": "block",
                                "path": [
                                    "format",
                                    "page_icon"
                                ],
                                "command": "set",
                                "args": newIcon
                            }
                        ]
                    }
                ]
            }

            axios.post("https://www.notion.so/api/v3/submitTransaction", body, this.notion.auth)
            .then(r => {

                resolve(true)

            })
            .catch(e => {

                resolve(e)

            })

        })

    }

    /**
     * Troca o Icone da pagina
     * 
     * @returns True se deu certo, Object se deu errado
     * 
     * @param newCover - Novo Cover (O link de uma imagem)
     * @param position - posição da imagem dentro da area do cover (0.1 - 1)
     * 
     * @example
     * <caption>Exemplo de uso (Os IDS são meramente ilustrativos)</caption>
     * 
     * const notion = new Notion("auydgasudr651324g763t473274g32bgdhuagds8ygduyasgd8s7t65746235467234gbjbsjhbfauybaisnudbuasygduiashd78364yh3b2ino0r9fh9d78yvgybuehuirj7342837t4hjdfgbuyst3yhn",
     * "453hmkyo-2736-4167-so4b-a90e229aaafe")
     *
     * const page = new Page(notion, "ng703jp4-65c7-4c07-9e8c-5d1973ad79de")
     * 
     * page.ChangeCover("https://produtive.me/wp-content/uploads/2019/08/notion-logo-no-background.png", 0.5)
     * .then(r => {
     * 
     *      //SEU CODIGO -> r é a resposta (true)
     * 
     * })
     */
    ChangeCover = (newCover: string, position: number) => {

        return new Promise<boolean | object>(resolve => {

            const body = {

                "requestId": "Editando Cover da pagina "+this.id,
                "transactions": [
                    {
                        "id": "Editando Cover da pagina "+this.id,
                        "shardId": 14084,
                        "operations": [
                            {
                                "id": this.id,
                                "table": "block",
                                "path": [
                                    "format"
                                ],
                                "command": "update",
                                "args": {"age_cover_position": position}
                            }
                        ]
                    },
                    {
                        "id": "Editando Cover da pagina "+this.id,
                        "shardId": 14084,
                        "operations": [
                            {
                                "id": this.id,
                                "table": "block",
                                "path": [
                                    "format",
                                    "page_cover"
                                ],
                                "command": "set",
                                "args": newCover
                            }
                        ]
                    }
                ]
            }

            axios.post("https://www.notion.so/api/v3/submitTransaction", body, this.notion.auth)
            .then(r => {

                resolve(true)

            })
            .catch(e => {

                resolve(e)

            })

        })

    }

}
