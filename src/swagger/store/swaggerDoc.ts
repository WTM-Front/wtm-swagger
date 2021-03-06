/**
 * @author 冷 (https://github.com/LengYXin)
 * @email lengyingxin8966@gmail.com
 * @create date 2018-09-10 05:01:12
 * @modify date 2018-09-10 05:01:12
 * @desc [description]
*/
import { notification } from 'antd';
import lodash from 'lodash';
import { action, observable, runInAction, toJS } from "mobx";
// import wtmfront from 'wtmfront.json';
import Http from "./HttpBasics";
import decompose from './decompose';
class ObservableStore {
    /**
     * 构造
     */
    constructor() {

    }
    /** swagger 返回 数据 */
    SwaggerDocJson = {};
    /**当前进度 */
    @observable StepsCurrent = 0;
    /**是否连接脚手架 */
    @observable startFrame = false;
    /**项目信息 */
    @observable project: any = {
        containersPath: "",
        contextRoot: "",
        subMenuPath: "",
        wtmfrontConfig: {},
        templates: ['default']
    };
    /*** 现有模块列表 */
    @observable containers = {
        containers: [],
        resources: {}
    };
    /*** 模块列表 */
    @observable createParam = {
        // 组件信息
        containers: {},
        // 模型信息
        model: {}
    };
    @observable swaggerLoading = true;
    @observable createState = true;
    @observable docData = {
        // 模型控制器
        tags: [],
        // 公共接口
        common: [],
        // 模型列表
        definitions: {},
        // 错误列表
        error: [],
        paths: []
    };
    /**
     * 公共接口
     */
    map = (x) => {
        if (x.code) {
            if (x.code == 200) {
                return x.data;
            }
            notification['error']({
                key: "codeError",
                message: x.code,
                description: x.message.toString(),
            });
        }
        return false
    }
    /**
     * 初始化 项目信息
     */
    async init() {
        const data = await Http.get("/server/init").map(this.map).toPromise();
        if (data) {
            runInAction(() => {
                this.project = data;
                this.startFrame = true;
                // console.log(this.project)
            })
        }
    }
    /**
     * 获取现有模块
     */
    async getContainers() {
        const data = await Http.get("/server/containers").map(this.map).toPromise();
        if (data) {
            runInAction(() => {
                this.containers = data;
            })
        }
    }
    /**
     * 创建模块
     * @param param 
     */
    async create(param?) {
        // return console.log(toJS(param));
        const data = await Http.post("/server/create", param.map(x => {
            x.actions = [];
            return x
        })).map(this.map).toPromise();
        if (data) {
            decompose.onReset();
            decompose.onEmpty();
            this.getContainers();
            this.StepsCurrent = 0;
            runInAction(() => {
                this.createState = true;
            });
            notification['success']({
                key: "codeError",
                message: '创建成功',
                description: '',
            });
        }
        return data;
    }
    /**
    * 修改模块
    * @param param 
    */
    async update(param?) {
        const data = await Http.post("/server/update", param).map(this.map).toPromise();
        if (data) {
            decompose.onReset();
            this.getContainers();
            notification['success']({
                key: "codeError",
                message: '修改成功',
                description: '',
            });
        }
        return data;
    }
    /**
     * 删除
     * @param param 
     */
    async  delete(param) {
        delete param.pageConfig
        const data = await Http.post("/server/delete", param).map(this.map).toPromise();
        if (data) {
            this.getContainers();
            notification['success']({
                key: "codeError",

                message: '删除成功',
                description: '',
            });
        }
    }
    /**
     * 获取model
     */

    async getModel() {
        if (!this.startFrame) {
            await this.init()
        }
        const data = await Http.get("/swaggerDoc")
            .map(docs => this.formatDocs(docs)).toPromise();
        runInAction(() => {
            this.swaggerLoading = false;
            this.docData = data;
        })
        return data
    }
    /**
     * 格式化docs
     * @param docs 
     */
    formatDocs(docs) {
        const wtmfront = this.project.wtmfrontConfig;
        if (!docs) {
            notification['error']({
                key: "codeError",

                message: '获取Swagger文档失败',
                description: '',
            });
            return this.docData
        }
        this.SwaggerDocJson = docs;
        let { tags = [], definitions, paths } = docs;
        let format = {
            // 模型控制器
            tags: [...tags],
            // 公共控制器
            common: [],
            // 模型列表
            definitions: { ...definitions },
            error: [],
            paths: []
        };

        // 分组所有 api 地址
        lodash.forEach(paths, (value, key) => {
            try {
                format.paths.push({
                    key,
                    value
                })
                // 排除的控制器
                if (wtmfront.exclude.some(x => lodash.includes(key, x))) return
                // const detail = lodash.find(value, (o) => o.tags && o.tags.length);
                let path: any = {};
                // 标准接口
                let standard: { name?: string, method?: string } = {};
                //console.log(key)
                // 公共控制器
                const isPubcliStandard = wtmfront.public.some(x => lodash.includes(key, x)) //lodash.includes(wtmfront.publicStandard, key);
                // console.log(isPubcliStandard, wtmfront.excludeStandard, key);
                // 公共控制器
                if (isPubcliStandard) {
                    format.common.push({
                        key,
                        path: value
                    });
                } else {
                    // 匹配当前接口是否符合 配置要求
                    standard = lodash.find(wtmfront.include, (o) => {
                        return lodash.includes(key, o.name)
                    })
                    //  if(!standard)return;
                }
                // 解析出错 数据
                if (typeof standard == "undefined") {
                    format.error.push({
                        key,
                        value
                    })
                    return console.warn("匹配失败", key);
                }
                // 请求类型 统一小写
                const method = lodash.toLower(standard.method);
                // 获取文档中的对应类型接口
                path = value[method];
                if (path) {
                    // 获取 tag 名称。
                    const tagName = lodash.find(path.tags, (o) => o && o.length);
                    const tag = lodash.find(format.tags, (o) => o.name == tagName);
                    // tag 已经存在直接 添加 api 解析地址
                    if (tag) {
                        // tag.paths = tag.paths || [];
                        // tag.paths.push({
                        //     key,
                        //     typeKey,
                        //     ...path
                        // });
                        tag.paths = tag.paths || {};
                        tag.paths[key] = {
                            key,
                            method,
                            ...path
                        }
                    } else {
                        const tag = {
                            name: tagName,
                            // paths: [{
                            //     key,
                            //     typeKey,
                            //     ...path
                            // }]
                            paths: {}
                        }
                        tag.paths[key] = {
                            key,
                            method,
                            ...path
                        }
                        format.tags.push(tag);
                    }
                }
            } catch (error) {
                console.error(key, error);
                notification['error']({
                    key: "codeError",
                    message: `解析Swagger文档失败 Molde:${key}`,
                    description: error.message,
                });
            }
        });

        format.tags = format.tags.filter(x => !lodash.isNil(x.paths))
        notification.info({
            key: "codeError",

            message: `解析完成`,
            description: `成功（${format.tags.length}）失败（${format.error.length}）`,
        })
        console.log(format);
        return format;
    }
    /**
     * 创建模块进度
     * @param StepsCurrent 进度
     */
    @action.bound
    updateStepsCurrent(StepsCurrent) {
        this.StepsCurrent += StepsCurrent;
    }
    @action.bound
    updateCPContainers(Containers = {}) {
        this.createParam.containers = { ...this.createParam.containers, ...Containers }
    }
    @action.bound
    updateCPmodel(model = {}) {
        this.createParam.model = { ...this.createParam.model, ...model }
    }
}
export default new ObservableStore();



