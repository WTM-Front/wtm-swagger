/**
 * @author 冷 (https://github.com/LengYXin)
 * @email lengyingxin8966@gmail.com
 * @create date 2018-09-10 05:01:38
 * @modify date 2018-09-10 05:01:38
 * @desc [description]
*/
import { Tree } from 'antd';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import Store from '../store';
const TreeNode = Tree.TreeNode;
// import Container from './test/Container';
@inject(() => Store)
@observer
export default class App extends React.Component<any, any> {
    render() {
        return (
            <div>
                <h2>项目信息~</h2>
                <p><span>项目地址: </span><span>{this.props.swaggerDoc.project.contextRoot}</span></p>
                <p><span>菜单地址: </span><span>{this.props.swaggerDoc.project.subMenuPath}</span></p>
                <p><span>组件地址: </span><span>{this.props.swaggerDoc.project.containersPath}</span></p>
            </div>
        );
    }
}

