import weakref


class DBColumnTypeEnum(object):
    NORMAL = 0
    VIRTUAL = 1


class DBRowset(object):
    __guid__ = 'data_wrapper.DBRowset'
    __passbyvalue__ = True

    def __init__(self, header, rows, **kwargs):
        if not isinstance(header, DBRowDescriptor):
            header = DBRowDescriptor(header, **kwargs)
        self._rs = [DBRow(header, list(row), **kwargs) for row in rows]
        self.header = header

    def __repr__(self):
        return f'<DBRowset {repr(self._rs)}>'

    def __getslice__(self, i, j):
        return DBRowset(self.header, list.__getslice__(self, i, j))

    def __len__(self):
        return len(self._rs)

    def __iter__(self):
        for r in self._rs:
            yield r

    def __getitem__(self, i):
        return self._rs[i]

    def __nonzero__(self):
        return len(self) > 0

    def copy(self):
        return DBRowset(self.header, self)

    def get_column_names(self):
        return self.header.keys()

    @property
    def columns(self):
        return self.header.keys()

    def insert_new(self, value):
        self.append(DBRow(self.header, value))

    def sort_(self, column_name, case_insensitive=False, reverse=False):
        ix = self.header.keys().index(column_name)
        if case_insensitive:

            def Key(a):
                return a[ix].upper()

        else:

            def Key(a):
                return a[ix]

        self._rs.sort(key=Key, reverse=reverse)

    def index_(self, column_name):
        ir = DBIndexedRowset(self.header, column_name)
        ir.build(self)
        return ir

    index = index_

    def filter_(self, column_name, index_name=None, allow_duplicated_compound_keys=False,
                give_me_sets=False):
        fr = DBFilterRowset(self.header, column_name, index_name, allow_duplicated_compound_keys,
                            give_me_sets)
        fr.build(self)
        return fr

    filter = filter_

    def append(self, row):
        self._rs.append(row)

    def extend(self, rs):
        self._rs.extend(rs)

    def unpack(self, colsNotTounpack=[]):
        t = []
        for row in self:
            entry = {}
            for col in self.header.keys():
                if col not in colsNotTounpack:
                    entry[col] = row[self.header.Index(col)]

            t.append(entry)

        return t

    def dump(self):
        return (self.header.dump(), [k.__data__ for k in self])

    @classmethod
    def parse(cls, data):
        return cls(DBRowDescriptor.parse(data[0]), data[1])


class ColumnDescriptor(object):
    __passbyvalue__ = True
    name = ''
    column_type = DBColumnTypeEnum.NORMAL
    func = None
    _column_des_cache = weakref.WeakValueDictionary()

    def __new__(cls, name='', column_type=DBColumnTypeEnum.NORMAL, func=None):
        if (name, column_type, func) in cls._column_des_cache:
            return cls._column_des_cache[name, column_type, func]
        else:
            self = super(ColumnDescriptor, cls).__new__(cls)
            self.name = name
            self.column_type = column_type
            self.func = func
            cls._column_des_cache[name, column_type, func] = self
            return self

    def __init__(self, name, column_type=DBColumnTypeEnum.NORMAL, func=None):
        self.name = name
        self.column_type = column_type
        self.func = func

    def __repr__(self):
        return "<ColumnDescriptor:'%s', type:%d f:%s>" % (
        self.name, self.column_type, str(self.func))

    def __str__(self):
        return self.__repr__()

    def __eq__(self, other):
        if isinstance(other, basestring):
            return self.name == other
        elif isinstance(other, ColumnDescriptor):
            return self.name == other.name and self.column_type == other.column_type and \
                   self.func == other.func
        else:
            return False

    def is_virtual(self):
        return self.column_type == DBColumnTypeEnum.VIRTUAL

    def dump(self):
        t = [self.name, self.column_type]
        if self.column_type == DBColumnTypeEnum.VIRTUAL:
            t.append(self.dump_func(self.func))
        return t

    @classmethod
    def parse(cls, data):
        if data[1] == DBColumnTypeEnum.VIRTUAL:
            return cls(data[0], data[1], cls.parse_func(data[2]))
        else:
            return cls(*data)

    @classmethod
    def dump_func(cls, func):
        # cls.init_func_code()
        # return cls.func_to_code[func]
        return None

    @classmethod
    def parse_func(cls, code):
        # cls.init_func_code()
        # return cls.code_to_func[code]
        return None


class DBRowDescriptor(object):
    __passbyvalue__ = True
    _virtual = list()

    def __init__(self, args=(), **kwargs):
        self._virtual = list()
        if isinstance(args, DBRowDescriptor):
            self._columns = list(args._columns)
            self.reset_column(args._virtual)
            self.virtual = list(args._virtual)
        else:
            desc = []
            if args is None:
                args = []
            for i, column in enumerate(args):
                if isinstance(column, tuple) or isinstance(column, list):
                    desc.append(ColumnDescriptor(str(column[0])))
                else:
                    desc.append(ColumnDescriptor(str(column)))

            self._columns = desc
            self.virtual = list(kwargs.get('virtual_columns', []))

    @property
    def virtual(self):
        return self._virtual

    @property
    def columns(self):
        return [x.name for x in self]

    @virtual.setter
    def virtual(self, values):
        self.clear_virtual()
        self.append_virtual(values)

    def reset_column(self, values):
        for item in values:
            index = self.index(item[0])
            del self._columns[index]

    def clear_virtual(self):
        if self._virtual:
            for item in self._virtual:
                index = self.index(item[0])
                del self._columns[index]

            self._virtual = []

    def append_virtual(self, values):
        if values:
            if isinstance(values, (tuple, list)):
                if not isinstance(values[0], (tuple, list)):
                    values = (values,)
            for item in values:
                column_name = str(item[0])
                desc = ColumnDescriptor(column_name, column_type=DBColumnTypeEnum.VIRTUAL,
                                        func=item[1])
                if column_name in self.columns:
                    self[self.index(column_name)] = desc
                else:
                    self._virtual.append(item)
                    self.append(desc)

    def __repr__(self):
        return self.__str__()

    def __str__(self):
        return '<DBRowDescriptor[%s]>' % ', '.join([i.__repr__() for i in self])

    def index(self, value):
        try:
            return self.columns.index(value)
        except ValueError as e:
            raise KeyError('key %s not found %s, %s' % (value, self, e))

    def keys(self):
        return self.columns

    def size(self):
        return len(self._columns)

    def __len__(self):
        return self.size()

    def __getitem__(self, i):
        return self._columns[i]

    def __setitem__(self, i, v):
        self._columns[i] = v

    def __iter__(self):
        for col in self._columns:
            yield col

    def __eq__(self, other):
        if not isinstance(other, DBRowDescriptor):
            return False
        return self._columns == other._columns

    def __contains__(self, key):
        for col in self._columns:
            if col.name == key:
                return True

        return False

    def append(self, col):
        self._columns.append(col)

    def dump(self):
        return [k.dump() for k in self]

    @classmethod
    def parse(cls, data):
        t = cls()
        for d in data:
            cd = ColumnDescriptor.parse(d)
            t.append(cd)
            if cd.column_type == DBColumnTypeEnum.VIRTUAL:
                t._virtual.append((cd.name, cd.func))

        return t


class DBRow(object):
    __passbyvalue__ = True
    __header__ = DBRowDescriptor()
    __index = 0
    __data__ = []

    def __init__(self, *args, **kwargs):
        arg_count = len(args)
        if arg_count == 1:
            arg1 = args[0]
            if isinstance(arg1, DBRow):
                self.__header__ = DBRowDescriptor(arg1.__header__)
                self.__data__ = list(arg1.__data__)
            elif isinstance(arg1, DBRowDescriptor):
                self.__header__ = arg1
                self.__data__ = [None] * len(self.__header__)
            else:
                raise RuntimeError('DBRow create error', args)
        elif arg_count >= 2:
            header = args[0]
            data = args[1]
            if arg_count > 2:
                reuse = args[2]
            else:
                reuse = False
            if isinstance(header, (tuple, list)):
                header = DBRowDescriptor(header)
            if isinstance(header, DBRowDescriptor) and isinstance(data, (tuple, list)):
                self.__header__ = header
                if reuse:
                    self.__data__ = data
                else:
                    self.__data__ = [(v.encode('utf-8') if isinstance(v, str) else v) for v in data]
        else:
            raise RuntimeError('DBRow create error', args)

    @property
    def line(self):
        return self

    @property
    def __columns__(self):
        return self.__header__._columns

    def __getitem__(self, index):
        if isinstance(index, basestring):
            return getattr(self, index)
        if index >= self.size():
            raise IndexError('index(%s) beyond size(%s) in dbrow' % (index, self.size()))
        desc = self.__header__[index]
        if desc.column_type == DBColumnTypeEnum.VIRTUAL:
            if callable(desc.func):
                return desc.func(self)
            raise RuntimeError('virtual column(%s) in dbrow(%s) has no func' % (desc, self))
        else:
            return self.__data__[index]

    def __getattr__(self, column):
        if column not in self.__header__.columns:
            return self.__dict__.get(column, self.__dict__.get(column.encode()))
        else:
            return self[self.__header__.index(column)]

    def __repr__(self):
        s = []
        for k, d in zip(self.__header__, self.__data__):
            s.append(f'{k.name}={d}')
        for d in self.__data__[len(self.__header__):]:
            s.append(repr(d))
        return f"<DBRow {', '.join(s)}>"

    def __str__(self):
        return self.__repr__()

    def __setitem__(self, index, value):
        if isinstance(index, basestring):
            return setattr(self, index, value)
        if index >= self.size():
            raise IndexError('index(%d) beyond size(%d) in dbrow' % (index, self.size()))
        desc = self.__header__[index]
        if desc.column_type == DBColumnTypeEnum.VIRTUAL:
            raise RuntimeError('virtual columns(%s) cannot set value(%s)', desc, value)
        self.__data__[index] = value

    def to_dict(self):
        ret = {}
        for index, name in enumerate(self.__header__.columns):
            ret[name] = self.__data__[index]

        return ret

    @staticmethod
    def gen_dbrow_by_dict_or_list_or_cls(desc, dict_or_list_or_cls):
        desc_list = dict_or_list_or_cls
        if isinstance(dict_or_list_or_cls, dict):
            desc_list = [dict_or_list_or_cls.get(x, None) for x in desc]
        elif isinstance(dict_or_list_or_cls, (list, tuple)):
            pass
        else:
            desc_list = []
            for x in desc:
                try:
                    attr = getattr(dict_or_list_or_cls, x, None)
                except Exception:
                    attr = None

                desc_list.append(attr)

        return DBRow(desc, desc_list)

    def __setattr__(self, key, value):
        if key not in self.__header__.columns:
            super(DBRow, self).__setattr__(key, value)
        else:
            self[self.__header__.index(key)] = value

    def __len__(self):
        return len(self.__header__)

    def __iter__(self):
        self.__index = 0
        return self

    def size(self):
        return self.__header__.size()

    def next(self):
        if self.__index >= self.size():
            self.__index = 0
            raise StopIteration
        self.__index += 1
        return self[self.__index - 1]

    def __contains__(self, item):
        return item in self.__data__

    def dump(self):
        return (self.__header__.dump(), self.__data__)

    @classmethod
    def parse(cls, data):
        return cls(DBRowDescriptor.parse(data[0]), data[1])


class DBIndexedRowset(dict):
    __guid__ = 'data_wrapper.DBIndexedRowset'

    def __init__(self, header, column_name):
        self.header = header
        self.column_name = column_name

    @property
    def columns(self):
        return self.header.keys()

    def build(self, rowset):
        if '.' in self.column_name:
            keys = self.column_name.split('.')
            c = 0
            for row in rowset:
                combined_key = []
                for key in keys:
                    combined_key.append(row[key])

                self[tuple(combined_key)] = row
                c += 1
                if c == 25000:
                    c = 0

        else:
            key_idx = self.header.keys().index(self.column_name)
            for item in rowset:
                self[item[key_idx]] = item

    def rebuild(self, rowset):
        self.clear()
        self.build(rowset)


class DBFilterRowset(dict):
    __guid__ = 'data_wrapper.DBFilterRowset'

    def __init__(self, header, column_name, index_name=None, allow_duplicated_compound_keys=False,
                 give_me_sets=False):
        self.header = header
        self.column_name = column_name
        self.index_name = index_name
        self.allow_duplicated_compound_keys = allow_duplicated_compound_keys
        self.give_me_sets = give_me_sets
        super(DBFilterRowset, self).__init__()

    @property
    def columns(self):
        return self.header.keys()

    def build(self, rowset):
        key_idx = self.header.keys().index(self.column_name)
        if self.index_name is None:
            for row in rowset:
                key = row[key_idx]
                if key in self:
                    if self.give_me_sets:
                        self[key].add(row)
                    else:
                        self[key].append(row)
                elif self.give_me_sets:
                    self[key] = set([row])
                else:
                    self[key] = DBRowset(row.__header__, [row])

        else:
            key_2_idx = self.header.keys().index(self.index_name)
            for row in rowset:
                key = row[key_idx]
                key2 = row[key_2_idx]
                if key not in self:
                    self[key] = {}
                if self.allow_duplicated_compound_keys:
                    if key2 not in self[key]:
                        if self.give_me_sets:
                            self[key][key2] = set()
                        else:
                            self[key][key2] = DBRowset(row.__header__, [])
                    if self.give_me_sets:
                        self[key][key2].add(row)
                    else:
                        self[key][key2].append(row)
                else:
                    self[key][key2] = row

    def rebuild(self, rowset):
        self.clear()
        self.build(rowset)


def parse_db_result(result_sets, **kwargs):
    rowsets = [DBRowset(DBRowDescriptor(desc, **kwargs), rows, **kwargs) for desc, rows in
               result_sets]
    ret = rowsets
    if len(rowsets) == 1:
        ret = only_rowset = rowsets[0]
        if len(only_rowset) == 1:
            only_row = only_rowset[0]
            if len(only_row) == 1 and only_rowset.header[0].name == 'sql_return':
                ret = only_row[0]
    return ret
