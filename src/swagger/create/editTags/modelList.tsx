/**
 * @author 冷 (https://github.com/LengYXin)
 * @email lengyingxin8966@gmail.com
 * @create date 2018-09-10 04:47:37
 * @modify date 2018-09-10 04:47:37
 * @desc [description]
 */
import { Button, Col, Divider, Icon, List, Row, Switch, Select } from 'antd';
import { action, toJS } from 'mobx';
import lodash from 'lodash';
import { observer } from 'mobx-react';
import * as React from 'react';
import Source from '../../../components/drop/source';
import Store from '../../store';
const { swaggerDoc, decompose } = Store
const ColSpan = {
  key: 5,
  name: 5,
  type: 6,
  available: 2,
  update: 2,
  bind: 2
}

let gutter = 14
// @DragDropContext(HTML5Backend)
// @inject(()=>Store)
@observer
export default class App extends React.Component<
{ type: 'columns' | 'search' | 'insert' | 'update' | 'btn' },
any
> {
  @action.bound
  onChange(e, data, type = 'insert') {
    if (type == 'insert') {
      data.attribute.available = e
    } else {
      data.attribute.update = e
    }
    // ModelStore.lists.table.splice(lodash.findIndex(ModelStore.lists.table, x => x.key == data.key), 1, data)
  }
  moveCard(dragIndex: number, hoverIndex: number) {
    // console.log(dragIndex, hoverIndex);
    Store.decompose.onExchangeModel(this.props.type, dragIndex, hoverIndex)
  }
  dataSource() {
    return Store.decompose.Model[this.props.type].slice()
  }
  renderErrr() {
    if (Store.decompose.Model.name == "" || Store.decompose.Model.name == null) {
      return <AnalysisSelect {...this.props} />
    }
  }
  /**
   * 关联
   */
  renderExample(item) {
    // console.log(item)
    if (item.example && item.example.combo) {
      return (
        <>
          <span>
            combo：
            {item.example.combo}
          </span>
          <Divider type="vertical" />
          <Button icon="edit" onClick={() => { }} />
        </>
      )
    }
    return null
  }
  render() {
    if (this.props.type === 'btn') {
      const data = lodash.toArray(decompose.Model.actions)
      return (
        <>
          <Row type="flex" justify="center" align="top" gutter={gutter}>
            <Col span={ColSpan.name}>名称</Col>
            <Col span={ColSpan.available}>可用</Col>
          </Row>
          <List
            bordered
            dataSource={data}
            renderItem={item => (
              <List.Item style={{ width: '100%', }}>
                <Row
                  type="flex"
                  justify="center"
                  align="top"
                  gutter={gutter}
                  style={{ width: '100%' }}
                >
                  <Col span={ColSpan.name}>
                    {item.name}
                  </Col>
                  <Col span={ColSpan.available}>
                    <Switch
                      onChange={(flag) => {
                        //拿到对应的索引
                        //  let index=data.indexOf(item)
                        // let attr=Object.keys(toJS(item))[0]
                        //改变它的属性值
                        decompose.changeButton(item, flag)
                      }}
                      checkedChildren={<Icon type="check" />}
                      unCheckedChildren={<Icon type="cross" />}
                      defaultChecked={item.state}
                    />
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </>
      )
    }
    return (
      <div className="edit-model" style={{ textAlign: "left" }}>
        {this.renderErrr()}
        <List.Item>
          <Row type="flex" align="top" gutter={gutter} style={{ width: '100%', paddingLeft: 10 }}>
            <Col span={ColSpan.key}>Key</Col>
            <Col span={ColSpan.name}>描述</Col>
            <Col span={ColSpan.type}>数据类型</Col>
            <Col span={ColSpan.available}>启用</Col>
            {/* {this.props.type == 'insert' ? (
              <Col span={ColSpan.update}>编辑</Col>
            ) : null} */}
            {this.props.type != 'columns' ? (
              <Col span={ColSpan.bind}>编辑属性</Col>
            ) : null}
          </Row>
        </List.Item>
        {this.dataSource().map((item, index) => (
          <Source
            type="Sortable"
            key={item.key}
            index={index}
            moveCard={this.moveCard.bind(this)}
          >
            <List.Item>
              <Row type="flex" align="top" gutter={gutter} style={{ width: '100%', paddingLeft: 10 }}>
                <Col span={ColSpan.key}>
                  {item.key}
                </Col>
                <Col span={ColSpan.name}>
                  {item.description}
                </Col>
                <Col span={ColSpan.type}>
                  {item.type} | {item.format}
                </Col>
                <Col span={ColSpan.available}>
                  <Switch
                    onChange={e => {
                      this.onChange(e, item)
                    }}
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="cross" />}
                    // defaultChecked={item.attribute.available}
                    checked={item.attribute.available}
                  // disabled={
                  //   this.props.type == 'insert' && !item.allowEmptyValue
                  // }
                  />
                </Col>
                {/* {this.props.type == 'insert' ? (
                  <Col span={ColSpan.update}>
                    <Switch
                      onChange={e => {
                        this.onChange(e, item, 'update')
                      }}
                      checkedChildren={<Icon type="check" />}
                      unCheckedChildren={<Icon type="cross" />}
                      defaultChecked={item.attribute.update}
                    />
                  </Col>
                ) : null} */}
                {this.props.type != 'columns' ? (
                  <Col span={ColSpan.bind}>{this.renderExample(item)}</Col>
                ) : null}
              </Row>
            </List.Item>
          </Source>
        ))}
      </div>
    )
  }
}

/**
 * 错误连接解析
 */
class AnalysisSelect extends React.Component<{ type: 'columns' | 'search' | 'insert' | 'update' | 'btn' }, any> {
  selectValue = null;
  onAnalysis() {
    console.log(this.selectValue);
    if (this.selectValue) {
      switch (this.props.type) {
        case 'columns':
          decompose.analysisColumns(this.selectValue, true)
          break;
        case 'search':
          decompose.analysisSearch(this.selectValue, true)
          break;
        case 'insert':
        case 'update':
          decompose.analysisEdit(this.selectValue, true)
          break;

      }
    }
  }
  onSelectChange(e) {
    const errPath = swaggerDoc.docData.paths.find(x => x.key == e)
    if (errPath) {
      this.selectValue = toJS(errPath.value["get"] || errPath.value["post"]);
    }
  }
  render() {
    return (
      <Row>
        <Col span={22}>
          <Select
            style={{ width: '100%' }}
            allowClear
            showSearch
            placeholder="模型路径"
            onChange={this.onSelectChange.bind(this)}
            filterOption={(inputValue, option) => option.key.toString().indexOf(inputValue) > -1}
          >
            {swaggerDoc.docData.paths.map(x => {
              return <Select.Option key={x.key} value={x.key}>{x.key}</Select.Option>
            })}
          </Select>
        </Col>
        <Col><Button onClick={this.onAnalysis.bind(this)}>解析</Button></Col>
      </Row>
    );
  }
}
