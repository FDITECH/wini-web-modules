import { BaseDA, ConfigData } from "./config";

export class DataController {
    private module: string;
    constructor(module: string) {
        this.module = module
    }

    async getAll() {
        const res = await BaseDA.get(ConfigData.url + 'data/getAll', {
            headers: {
                pid: ConfigData.pid,
                module: this.module,
            },
        })
        return res
    }

    async getProperties() {
        const res = await BaseDA.get(ConfigData.url + `setting/getProperties?name=${this.module}`, {
            headers: {
                pid: ConfigData.pid,
                module: 'column'
            }
        })
        return res
    }

    async aggregateList(options: { page?: number, size?: number, searchRaw?: string, filter?: string, sortby?: Array<{ prop: string, direction?: "ASC" | "DESC" }> } | undefined) {
        const res = await BaseDA.post(ConfigData.url + 'data/aggregateList', {
            headers: {
                pid: ConfigData.pid,
                module: this.module,
            },
            body: options
        })
        return res
    }

    async filterByEmptyKey(options: { page?: number, size?: number, searchRaw?: string, key: string, notEmpty?: boolean, sortby?: Array<{ prop: string, direction?: "ASC" | "DESC" }> } | undefined) {
        const res = await BaseDA.post(ConfigData.url + 'data/filterByEmptyKey', {
            headers: {
                pid: ConfigData.pid,
                module: this.module,
            },
            body: options
        })
        return res
    }

    async group(options: { searchRaw?: string, reducers: string }) {
        const res = await BaseDA.post(ConfigData.url + 'data/group', {
            headers: {
                pid: ConfigData.pid,
                module: this.module,
            },
            body: options
        })
        return res
    }

    async getListSimple(options: { page?: number, size?: number, query?: string, returns?: Array<string>, sortby?: { BY: string, DIRECTION?: "ASC" | "DESC" } } | undefined) {
        const res = await BaseDA.post(ConfigData.url + 'data/getListSimple', {
            headers: {
                pid: ConfigData.pid,
                module: this.module,
            },
            body: { searchRaw: options?.query?.length ? options?.query : "*", page: options?.page ?? 1, size: options?.size ?? 10, returns: options?.returns, sortby: options?.sortby }
        })
        return res
    }

    async getById(id: string) {
        const res = await BaseDA.post(ConfigData.url + `data/getById?id=${id}`, {
            headers: {
                pid: ConfigData.pid,
                module: this.module,
            },
        })
        return res
    }

    async getByListId(ids: Array<string>) {
        const res = await BaseDA.post(ConfigData.url + 'data/getByIds', {
            headers: {
                pid: ConfigData.pid,
                module: this.module,
            },
            body: { ids: ids }
        })
        return res
    }

    async add(data: Array<{ [p: string]: any }>) {
        const res = await BaseDA.post(ConfigData.url + 'data/action?action=add', {
            headers: {
                pid: ConfigData.pid,
                module: this.module
            },
            body: { data: data }
        })
        return res
    }

    async edit(data: Array<{ [p: string]: any }>) {
        const res = await BaseDA.post(ConfigData.url + 'data/action?action=edit', {
            headers: {
                pid: ConfigData.pid,
                module: this.module
            },
            body: { data: data }
        })
        return res
    }

    async delete(ids: Array<string>) {
        const res = await BaseDA.post(ConfigData.url + 'data/action?action=delete', {
            headers: {
                pid: ConfigData.pid,
                module: this.module
            },
            body: { ids: ids }
        })
        return res
    }

    async checkotp(idToken: string) {
        const res = await BaseDA.post(ConfigData.url + 'data/checkotp', {
            body: { idToken: idToken }
        })
        return res
    }
}

export class SettingDataController {
    private setting: "model" | "reducer" | "chart" | "form" | "card";
    private type: string;
    constructor(setting: "model" | "reducer" | "chart" | "form" | "card") {
        this.setting = setting
        if (setting === "model" || setting === "reducer") this.type = "report"
        else this.type = setting
    }

    async action(action: "add" | "edit" | "delete", options: { data?: Array<{ [p: string]: any }>, ids?: Array<string> }) {
        const res = await BaseDA.post(ConfigData.url + `data/${this.type === "report" ? `${this.type}/${this.setting}` : this.type}/action?action=${action}`, {
            headers: { pid: ConfigData.pid },
            body: { data: options.data, ids: options.ids }
        })
        return res
    }

    async getListSimple(options: { page?: number, size?: number, query?: string, returns?: Array<string>, sortby?: { BY: string, DIRECTION?: "ASC" | "DESC" } } | undefined) {
        const res = await BaseDA.post(ConfigData.url + `data/${this.type === "report" ? `${this.type}/${this.setting}` : this.type}/getListSimple`, {
            headers: { pid: ConfigData.pid },
            body: { searchRaw: options?.query?.length ? options?.query : "*", page: options?.page ?? 1, size: options?.size ?? 10, returns: options?.returns, sortby: options?.sortby }
        })
        return res
    }

    async getByIds(ids: Array<string>) {
        const res = await BaseDA.post(ConfigData.url + `data/${this.type === "report" ? `${this.type}/${this.setting}` : this.type}/getByIds`, {
            headers: { pid: ConfigData.pid },
            body: { ids: ids }
        })
        return res
    }
}