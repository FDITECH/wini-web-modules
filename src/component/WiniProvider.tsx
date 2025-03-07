import { useEffect } from "react"
import { ConfigData } from "../controller/config"

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
    onInvalidToken?: () => void
}

export const WiniProvider = (props: Props) => {

    useEffect(() => {
        ConfigData.pid = props.pid
        ConfigData.url = props.url
        ConfigData.imgUrlId = props.imgUrlId
        if (props.onInvalidToken) ConfigData.onInvalidToken = props.onInvalidToken
    }, [props.pid])

    return <></>
}