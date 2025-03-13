import { useEffect } from "react"
import { ConfigData } from "../controller/config"
import { TableController } from "../controller/setting"

interface Props {
    /**
     * project id on admin wini
     * */
    pid: string,
    /**
     * api link
     * */
    url: string,
    imgUrlId: string,
    onInvalidToken?: () => void,
    children?: React.ReactNode
}

export const WiniProvider = (props: Props) => {
    ConfigData.pid = props.pid
    ConfigData.url = props.url
    ConfigData.imgUrlId = props.imgUrlId
    if (props.onInvalidToken) ConfigData.onInvalidToken = props.onInvalidToken
    
    useEffect(() => {
        ConfigData.pid = props.pid
        const _desginTokenController = new TableController("designtoken")
        _desginTokenController.getAll().then(res => {
            if (res.code === 200 && res.data.length) {
                const designTokens = res.data.map((e: any) => {
                    return { ...e, Value: typeof e.Value === "string" ? JSON.parse(e.Value) : e.Value }
                })
                const tokenValues = designTokens.filter((e: any) => e.Type !== "group")
                let styleElement = document.head.querySelector(":scope > .designTokens") ?? document.createElement('style') as any;
                styleElement.type = 'text/css';
                const _innerHTML = `html { \n${tokenValues.map((e: any) => e.Value?.lightMode ? `${e.Name}: ${e.Value.lightMode};` : "").join('\n')}\n }\n\nhtml.dark { \n${tokenValues.map((e: any) => e.Value?.darkMode ? `${e.Name}: ${e.Value.darkMode};` : "").join('\n')}\n }`
                styleElement.innerHTML = _innerHTML;
                if (!styleElement.classList.contains("designTokens")) {
                    styleElement.classList.add("designTokens")
                    document.head.appendChild(styleElement)
                }
            }
        })
    }, [props.pid])

    useEffect(() => {
        ConfigData.url = props.url
    }, [props.url])

    useEffect(() => {
        ConfigData.imgUrlId = props.imgUrlId
    }, [props.imgUrlId])

    useEffect(() => {
        if (props.onInvalidToken) ConfigData.onInvalidToken = props.onInvalidToken
    }, [props.onInvalidToken])

    return <>{props.children}</>
}