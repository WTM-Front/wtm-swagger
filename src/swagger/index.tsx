/**
 * @author 冷 (https://github.com/LengYXin)
 * @email lengyingxin8966@gmail.com
 * @create date 2018-09-10 05:01:20
 * @modify date 2018-09-10 05:01:20
 * @desc [description]
*/
import { Modal, Tabs } from 'antd';
import { observer } from 'mobx-react';
import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Create from './create/index';
import ExistingItems from './existingItems';
import Info from './info';
import Store from './store';
import "./style.less";
const { swaggerDoc, decompose } = Store;
const TabPane = Tabs.TabPane;
@DragDropContext(HTML5Backend)
@observer
export default class IApp extends React.Component<any, any> {
    async componentDidMount() {
         swaggerDoc.getContainers();
         swaggerDoc.getModel();
    }
    onChange(key) {
        if (key == 3) {
            swaggerDoc.getContainers();
        }
    }
    public render() {
        return (
            <div className="sam-container-manage">
                <Tabs defaultActiveKey="2" onChange={this.onChange.bind(this)} >
                    <TabPane tab="基础信息" key="1">
                        <Info />
                    </TabPane>
                    <TabPane tab="创建组件" key="2">
                        <Create />
                    </TabPane>
                    <TabPane tab="组件列表" key="3">
                        <ExistingItems />
                    </TabPane>
                </Tabs>
                <Modal
                    title="模型JSON"
                    width="70%"
                    centered
                    footer={null}
                    visible={decompose.visible.ModelJSON}
                    onCancel={() => {
                        decompose.onVisible("ModelJSON", false)
                    }}
                >
                    <pre>
                        <code> {decompose.ModelJSON}</code>
                    </pre>
                </Modal>
            </div>

        );
    }
}
