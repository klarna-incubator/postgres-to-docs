import { CompositeTypeDescription, getSchema } from './get-schema'
import {
  Column,
  CompositeType,
  CustomType,
  ForeignKey,
  PrimaryKey,
  Repository,
  Table,
} from './repository'

const emptyRepository = {
  selectTables: jest.fn().mockResolvedValue([]),
  selectColumns: jest.fn().mockResolvedValue([]),
  selectViews: jest.fn().mockResolvedValue([]),
  selectForeignKeys: jest.fn().mockResolvedValue([]),
  selectPrimaryKeys: jest.fn().mockResolvedValue([]),
  selectCustomTypes: jest.fn().mockResolvedValue([]),
  selectCompositeTypes: jest.fn().mockResolvedValue([]),
}

describe('Get schema', () => {
  it('returns empty results if no tables are available', async () => {
    const repository: Repository = {
      ...emptyRepository,
    }

    const schema = await getSchema(repository)
    expect(schema.tables.length).toBe(0)
    expect(schema.customTypes.length).toBe(0)
    expect(schema.compositeTypes.length).toBe(0)
    expect(schema.views.length).toBe(0)
  })

  it('returns columns grouped by table', async () => {
    const mockTableName = 'table'
    const mockTables: Table[] = [
      {
        name: mockTableName,
      },
    ]

    const mockColumns: Column[] = [
      {
        table: mockTableName,
        name: 'column_1',
        isNullable: true,
        dataType: 'int',
      },
      {
        table: mockTableName,
        name: 'column_2',
        isNullable: true,
        dataType: 'int',
      },
    ]
    const repository: Repository = {
      ...emptyRepository,
      selectTables: jest.fn().mockResolvedValue(mockTables),
      selectColumns: jest.fn().mockResolvedValue(mockColumns),
    }

    const schema = await getSchema(repository)
    expect(schema.tables.length).toBe(1)
    const schemaTable = schema.tables[0]

    expect(schemaTable.name).toBe(mockTableName)
    expect(schemaTable.columns.length).toBe(mockColumns.length)

    schemaTable.columns.forEach((c, index) => {
      expect(c.name).toBe(mockColumns[index].name)
    })
  })

  it('sets foreign keys and primary keys by table and column name', async () => {
    const mockTableName = 'table'
    const mockForeignTableName = 'foreign_table'
    const mockSourceColumn = 'column'
    const mockForeignColumn = 'foreign_column'

    const mockTables: Table[] = [
      {
        name: mockTableName,
      },
      { name: mockForeignTableName },
    ]

    const mockColumns: Column[] = [
      {
        table: mockTableName,
        name: mockSourceColumn,
        isNullable: true,
        dataType: 'int',
      },
      {
        table: mockForeignTableName,
        name: mockForeignColumn,
        isNullable: true,
        dataType: 'int',
      },
    ]

    const mockFKs: ForeignKey[] = [
      {
        constraintName: '',
        sourceTable: mockTableName,
        sourceColumn: mockSourceColumn,
        foreignTable: mockForeignTableName,
        foreignColumn: mockForeignColumn,
      },
    ]

    const mockPKs: PrimaryKey[] = [
      {
        constraintName: '',
        table: mockForeignTableName,
        column: mockForeignColumn,
      },
    ]
    const repository: Repository = {
      ...emptyRepository,
      selectTables: jest.fn().mockResolvedValue(mockTables),
      selectColumns: jest.fn().mockResolvedValue(mockColumns),
      selectForeignKeys: jest.fn().mockResolvedValue(mockFKs),
      selectPrimaryKeys: jest.fn().mockResolvedValue(mockPKs),
    }

    const schema = await getSchema(repository)
    expect(schema.tables.length).toBe(2)
    const sourceTable = schema.tables[0]
    const foreignTable = schema.tables[1]

    expect(sourceTable.columns[0].foreignKey).toBe(
      `${mockForeignTableName}.foreign_column`
    )
    expect(foreignTable.columns[0].isPrimaryKey).toBe(true)
  })

  it('sets custom types', async () => {
    const mockCustomTypes: CustomType[] = [
      { name: 'custom', internalName: '_custom', elements: ['el'] },
    ]
    const repository: Repository = {
      ...emptyRepository,
      selectCustomTypes: jest.fn().mockResolvedValue(mockCustomTypes),
    }

    const schema = await getSchema(repository)
    schema.customTypes.forEach((type, index) => {
      expect(type).toBe(mockCustomTypes[index])
    })
  })

  it('ignores custom types without elements', async () => {
    const mockCustomTypes: CustomType[] = [
      { name: 'custom', internalName: '_custom', elements: [] },
    ]
    const repository: Repository = {
      ...emptyRepository,
      selectCustomTypes: jest.fn().mockResolvedValue(mockCustomTypes),
    }

    const schema = await getSchema(repository)
    expect(schema.customTypes.length).toBe(0)
  })

  it('groups composite types', async () => {
    const mockCompositeTypeName = 'custom'
    const mockFirstCompositeType = {
      name: mockCompositeTypeName,
      columnName: 'column_1',
      dataType: 'int',
      position: 1,
      isRequired: true,
    }

    const mockSecondCompositeType = {
      name: mockCompositeTypeName,
      columnName: 'column_2',
      dataType: 'int',
      position: 2,
      isRequired: true,
    }

    const mockCompositeTypes: CompositeType[] = [
      mockFirstCompositeType,
      mockSecondCompositeType,
    ]
    const repository: Repository = {
      ...emptyRepository,
      selectCompositeTypes: jest.fn().mockResolvedValue(mockCompositeTypes),
    }

    const schema = await getSchema(repository)
    expect(schema.compositeTypes.length).toBe(1)

    const expectedStructure: CompositeTypeDescription[] = [
      {
        name: mockCompositeTypeName,
        fields: [
          {
            name: mockFirstCompositeType.columnName,
            dataType: mockFirstCompositeType.dataType,
            position: mockFirstCompositeType.position,
            isRequired: mockFirstCompositeType.isRequired,
          },
          {
            name: mockSecondCompositeType.columnName,
            dataType: mockSecondCompositeType.dataType,
            position: mockSecondCompositeType.position,
            isRequired: mockSecondCompositeType.isRequired,
          },
        ],
      },
    ]

    expect(schema.compositeTypes).toEqual(expectedStructure)
  })
})
