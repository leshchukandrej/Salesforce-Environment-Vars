import { EditOutlined, LinkOutlined } from '@ant-design/icons';
import { getApex, getFormula, isJson, copy } from '@src/lib/util';
import { Button, Table, Tag, Tooltip, Typography, Row, Col } from 'antd';
import ButtonGroup from 'antd/lib/button/button-group';
import * as React from 'react';
import ReactJson from 'react-json-view';
import { CopyCode } from './EnvItem/CopyCode';
import { PaginationConfig } from 'antd/lib/pagination';
import { SorterResult } from 'antd/lib/table/interface';
import { KeyDisplay } from './EnvItem/KeyDisplay';

const { Paragraph, Text } = Typography;

export interface EnvTableProps {
  items: EnvVar[];
  onEdit: (item: EnvVar) => void;
  groups: string[];
  defaultFilteredGroup?: string;
}

export const EnvTable = (props: EnvTableProps) => {
  const { onEdit } = props;
  const [filters, setFilters] = React.useState<Record<string, React.Key[]>>(
    props.defaultFilteredGroup ? { group: [props.defaultFilteredGroup] } : {}
  );
  const handleChange = (
    pagination: PaginationConfig,
    filters: Record<string, React.Key[]>,
    sorter: SorterResult<EnvVar> | SorterResult<EnvVar>[]
  ) => {
    setFilters(filters);
  };

  return (
    <div>
      <Table<EnvVar> dataSource={props.items} bordered scroll={{ x: 'max-content' }} onChange={handleChange}>
        <Table.Column<EnvVar>
          key='key'
          title='Key'
          fixed='left'
          sorter={(a, b) => a.key.localeCompare(b.key)}
          render={(text, record) => {
            return (
              <span>
                <KeyDisplay item={record} />
              </span>
            );
          }}
        />
        <Table.Column<EnvVar>
          key='group'
          title='Group'
          width='10%'
          sorter={(a, b) => a.group.localeCompare(b.group)}
          filters={props.groups.map(g => ({ text: g, value: g }))}
          filterMultiple={false}
          onFilter={(value: string, record) => record.group.indexOf(value) === 0}
          filteredValue={filters['group']}
          render={(text, record) => {
            return (
              <span>
                <Tag
                  color='#87d068'
                  onClick={() => copy(`${window.location}?group=${record.group}`, 'Group Link copied to clipboard')}
                >
                  {record.group}
                </Tag>
              </span>
            );
          }}
        />
        <Table.Column<EnvVar>
          key='type'
          width='10%'
          title='Data Type'
          render={(text, record) => {
            return record.dataType;
          }}
        />
        <Table.Column<EnvVar>
          key='value'
          title='Value'
          width='25%'
          render={(text, record) => {
            if (
              (record.dataType === 'ANY' ||
                record.dataType === 'Map<String,String>' ||
                record.dataType === 'String[]') &&
              isJson(record.value)
            ) {
              return (
                <ReactJson
                  src={JSON.parse(record.value)}
                  collapsed={true}
                  name={false}
                  enableClipboard={true}
                  displayObjectSize={false}
                  displayDataTypes={false}
                />
              );
            }
            return (
              <Typography.Paragraph
                style={{ fontSize: 16 }}
                copyable={!record.secret}
                // code
                ellipsis={{ expandable: true }}
              >
                {record.secret ? '******' : record.value}
              </Typography.Paragraph>
            );
          }}
        />
        <Table.Column<EnvVar>
          key='notes'
          width='25%'
          title='Notes'
          render={(text, record) => {
            return <Typography.Paragraph ellipsis={{ expandable: true }}>{record.notes}</Typography.Paragraph>;
          }}
        />
        <Table.Column<EnvVar>
          key='actions'
          width='10%'
          title='Actions'
          align='center'
          render={(text, record) => {
            const allowFormula =
              (!record.secret && record.dataType === 'Boolean') ||
              record.dataType === 'String' ||
              record.dataType === 'Integer' ||
              record.dataType === 'Decimal';
            return (
              <ButtonGroup style={{ float: 'right' }}>
                <CopyCode text='' icon='code' onCopy={() => {}} codeFunc={getApex} item={record} />
                <CopyCode
                  text=''
                  icon='number'
                  disabled={!allowFormula}
                  onCopy={() => {}}
                  codeFunc={getFormula}
                  item={record}
                />
                <Tooltip title='Edit'>
                  <Button type='primary' icon={<EditOutlined />} onClick={() => onEdit(record)} />
                </Tooltip>
              </ButtonGroup>
            );
          }}
        />
      </Table>
    </div>
  );
};
