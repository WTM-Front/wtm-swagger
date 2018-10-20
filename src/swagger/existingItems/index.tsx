/**
 * @author 冷 (https://github.com/LengYXin)
 * @email lengyingxin8966@gmail.com
 * @create date 2018-09-10 05:01:34
 * @modify date 2018-09-10 05:01:34
 * @desc [description]
*/
import { Avatar, List, Skeleton, Popconfirm, Modal } from 'antd';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import ShowCode from '../create/showCode';
import Store from '../store';
const { swaggerDoc, decompose } = Store;
import { EditModelBody } from '../create/editTags';
import "./style.less"
@inject(() => Store)
@observer
export default class App extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }
    state = {
        visible: false
    }
    componentDidMount() {

    }
    onDelete(x) {
        this.props.swaggerDoc.delete(x)
    }
    onUpdate(data) {
        // 以编辑修改
        decompose.onSetModel(data.pageConfig);
        this.setState({ visible: true })
    }
    render() {

        return (
            <div>
                <h1>已有组件</h1>
                <List
                    // loading={initLoading}
                    itemLayout="horizontal"
                    // loadMore={loadMore}
                    dataSource={this.props.swaggerDoc.containers.slice()}
                    renderItem={item => (
                        <List.Item actions={[
                            <ShowCode data={item.pageConfig} />,
                            <a onClick={this.onUpdate.bind(this, item)}>修改</a>,
                            <Popconfirm title="Sure to delete?" onConfirm={this.onDelete.bind(this, item)} >
                                <a >删除</a>
                            </Popconfirm>
                        ]}>
                            <Skeleton avatar title={false} loading={item.loading} active>
                                <List.Item.Meta
                                    avatar={<Avatar icon="menu-fold" />}
                                    description={item.name}
                                />
                            </Skeleton>
                        </List.Item>
                    )}
                />
                <Modal
                    title="修改"
                    width="70%"
                    className="existingItems-modal"
                    centered
                    footer={null}
                    visible={this.state.visible}
                    onCancel={() => {
                        decompose.onReset()
                        this.setState({ visible: false })
                    }}
                >
                    <EditModelBody onSave={e => console.log(e)} />
                </Modal>
            </div>
        );
    }
}
