import { ToastMessage } from "wini-web-components";
import axios from 'axios';
import { Util } from "./utils";

export class ConfigData {
    static pid = ""
    static url = ""
    static imgUrlId = "";
    static extraPlugins = undefined;
    static onInvalidToken = () => Util.clearCookie();
}

const getHeaders = async () => {
    let timeRefresh: any = Util.getCookie("timeRefresh")
    if (typeof timeRefresh === "string") timeRefresh = parseInt(timeRefresh)
    const now = Date.now() / 1000
    if (timeRefresh && timeRefresh > 0 && timeRefresh <= now) {
        const res = await fetch(ConfigData.url + 'data/refreshToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'refreshToken': Util.getCookie("refreshToken") }),
        })
        if (res.status === 200 || res.status === 201) {
            const jsonData = await res.json()
            if (jsonData.code === 200) {
                Util.setCookie("accessToken", jsonData.accessToken)
                Util.setCookie("timeRefresh", Date.now() / 1000 + 9 * 60)
                return {
                    'refreshToken': Util.getCookie("refreshToken"),
                    'Authorization': `Bearer ${Util.getCookie("accessToken")}`,
                    'Content-Type': 'application/json'
                }
            }
        }
        ConfigData.onInvalidToken()
        window.location.replace("/login")
    } else if (Util.getCookie("accessToken")) {
        return {
            'Authorization': `Bearer ${Util.getCookie("accessToken")}`,
            'Content-Type': 'application/json'
        }
    }
    return { 'Content-Type': 'application/json' }
}

export const imgFileTypes = [".png", ".svg", ".jpg", "jpeg", ".webp", ".gif"]

export class BaseDA {
    static post = async (url: string, options?: { headers?: { [k: string]: any }, body?: any }) => {
        try {
            let _headers: { [k: string]: any } = (await getHeaders()) ?? {}
            if (options?.headers) _headers = { ..._headers, ...options.headers }
            const response = await axios.post(url, options?.body, { headers: _headers })
            if (response.status === 200 || response.status === 201) {
                return response.data
            } else if (response.status === 204) {
                return {
                    message: 'ok',
                    data: options?.body
                }
            } else if (response.status === 401) {
                ToastMessage.errors('Không có quyền truy cập')
                window.location.replace('/login')
            } else {
                console.log("error: ??: ", response.statusText)
                return { status: response.status, message: response.statusText };
            }
        } catch (error) {
            ToastMessage.errors(error?.toString() as string)
            throw error;
        }
    }

    static postFile = async (url: string, options?: { headers?: { [k: string]: any }, body?: FormData }) => {
        try {
            if (options?.headers) {
                options.headers["Content-Type"] = "multipart/form-data"
            }
            const response = await axios.post(url, options?.body, { headers: options?.headers ?? { "Content-Type": "multipart/form-data" } })
            if (response.status === 200 || response.status === 201) {
                return response.data
            } else if (response.status === 204) {
                return {
                    message: 'ok',
                    data: options?.body
                }
            } else if (response.status === 401) {
                ToastMessage.errors('Không có quyền truy cập')
                window.location.replace('/login')
            } else {
                console.log("error: ??: ", response.statusText)
                return { status: response.status, message: response.statusText };
            }
        } catch (error) {
            console.error("Failed to POST data:", error);
            throw error;
        }
    }

    static get = async (url: string, options?: { headers?: { [k: string]: any } }) => {
        try {
            let _headers: { [k: string]: any } = (await getHeaders()) ?? {}
            if (options?.headers) _headers = { ..._headers, ...options.headers }
            const response = await axios.get(url, { headers: _headers })
            if (response.status === 200 || response.status === 201) {
                return response.data
            } else if (response.status === 204) {
                return {
                    message: 'ok',
                    // data: options?.body
                }
            } else if (response.status === 401) {
                ToastMessage.errors('Không có quyền truy cập')
                window.location.replace('/login')
            } else {
                console.log("error: ??: ", response.statusText)
                return { status: response.status, message: response.statusText };
            }
        } catch (error) {
            console.error("Failed to GET data:", error);
            throw error;
        }
    }

    static uploadFiles = async (listFile: Array<File>) => {
        listFile = [...listFile];
        // const headersObj: any = await getHeaders()
        const headersObj: any = { pid: ConfigData.pid }
        const formData = new FormData();
        listFile.forEach(e => {
            formData.append("files", e);
        })
        const response = await BaseDA.postFile(ConfigData.url + 'file/uploadfiles', {
            headers: headersObj,
            body: formData,
        })
        if (response.code === 200) {
            return response.data
        } else {
            ToastMessage.errors(response.message)
        }
        return null;
    }

    static getFilesInfor = async (ids: Array<string>) => {
        // const headersObj: any = await getHeaders()
        const headersObj: any = {}
        const response = await BaseDA.post(ConfigData.url + 'file/getFilesInfor', {
            headers: headersObj,
            body: { ids: ids },
        })
        return response
    }
}

export class CkEditorUploadAdapter {
    loader: any;
    xhr: XMLHttpRequest | undefined;


    constructor(loader: any) {
        // The file loader instance to use during the upload.
        this.loader = loader;
    }

    // Starts the upload process.
    upload() {
        return this.loader.file
            .then((file: any) => new Promise((resolve, reject) => {
                this._initRequest();
                this._initListeners(resolve, reject, file);
                this._sendRequest(file);
            }));
    }

    // Aborts the upload process.
    abort() {
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    // Initializes the XMLHttpRequest object using the URL passed to the constructor.
    _initRequest() {
        const xhr = this.xhr = new XMLHttpRequest();
        // Note that your request may look different. It is up to you and your editor
        // integration to choose the right communication channel. This example uses
        // a POST request with JSON as a data structure but your configuration
        // could be different.
        xhr.open('POST', ConfigData.url + 'file/uploadfiles', true);
        // xhr.setRequestHeader("Authorization", 'Bearer ' + localStorage.getItem("token"));
        xhr.responseType = 'json';
    }

    // Initializes XMLHttpRequest listeners.
    _initListeners(resolve: { (value: unknown): void; (arg0: { default: string }): void }, reject: { (reason?: any): void; (arg0: string | undefined): any }, file: { name: any; }) {
        const xhr = this.xhr;
        const loader = this.loader;
        const genericErrorText = `Couldn't upload file: ${file.name}.`;

        xhr?.addEventListener('error', () => reject(genericErrorText));
        xhr?.addEventListener('abort', () => reject());
        xhr?.addEventListener('load', () => {
            const response = xhr.response;

            // This example assumes the XHR server's "response" object will come with
            // an "error" which has its own "message" that can be passed to reject()
            // in the upload promise.
            //
            // Your integration may handle upload errors in a different way so make sure
            // it is done properly. The reject() function must be called when the upload fails.
            if (!response || response.error) {
                return reject(response && response.error ? response.error.message : genericErrorText);
            }

            // If the upload is successful, resolve the upload promise with an object containing
            // at least the "default" URL, pointing to the image on the server.
            // This URL will be used to display the image in the content. Learn more in the
            // UploadAdapter#upload documentation.
            resolve({
                default: ConfigData.imgUrlId + response.data[0].Id
            });
        });

        // Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
        // properties which are used e.g. to display the upload progress bar in the editor
        // user interface.
        if (xhr?.upload) {
            xhr.upload.addEventListener('progress', (evt: { lengthComputable: any; total: any; loaded: any; }) => {
                if (evt.lengthComputable) {
                    loader.uploadTotal = evt.total;
                    loader.uploaded = evt.loaded;
                }
            });
        }
    }

    // Prepares the data and sends the request.
    _sendRequest(file: string | Blob) {
        // Prepare the form data.
        const data = new FormData();

        data.append('files', file);

        // Important note: This is the right place to implement security mechanisms
        // like authentication and CSRF protection. For instance, you can use
        // XMLHttpRequest.setRequestHeader() to set the request headers containing
        // the CSRF token generated earlier by your application.

        // Send the request.
        this.xhr?.send(data);
    }
}