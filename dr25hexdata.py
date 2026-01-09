from drhex import Dr25Hex
import names

    
## TYPE_NAMES=((0x0001,'DrHex.FOREST'),
##             (0x0002,'DrHex.HILL'),
##             (0x0004,'DrHex.MOUNTAIN'),
##             (0x0008,'DrHex.PASS'),
##             (0x0010,'DrHex.SWAMP'),
##             (0x0020,'DrHex.RIVER'),
##             (0x0040,'DrHex.LAKE'),
##             (0x0080,'DrHex.LAKESHORE'),
##             (0x0100,'DrHex.SEA'),
##             (0x0200,'DrHex.SEASHORE'),
##             (0x0400,'DrHex.CASTLE'),
##             (0x0800,'DrHex.PORT'),
##             (0x1000,'DrHex.SCENIC'),
##             (0x2000,'DrHex.ANCIENT_BATTLEFIELD'),
##             (0x4000,'DrHex.ROYAL'),
##             (0x08000,'DrHex.NON_CASTLE_PORT'),
##             (0x10000,'DrHex.NAVIGABLE'))

## def make_type_string(type):
##     types_list = []
##     for tname in TYPE_NAMES:
##         if tname[0] & type != 0:
##             types_list.append(tname[1])
##     if len(types_list) == 0:
##         return "0"
##     else:
##         return '|'.join(types_list)

## def make_string_param(str):
##     if str is None:
##         return 'None'
##     else:
##         # Note: ' replaced by \' in str
##         return '\'%s\'' % (str.replace("'","\\'"),)
    
## def make_drhex_string(dhex):
##     if dhex is None:
##         return 'None'
##     col,row = dhex.get_location()
##     type = make_type_string(dhex.type)
##     name = make_string_param(dhex.get_name())
##     kingdom = make_string_param(dhex.get_kingdom())
##     return 'DrHex((%d,%d), %s, %s, %s, %d)' % (col, row, name, type, kingdom,
##                                                dhex.get_intrinsic())

## def write_col_methods(hexdata):
##     for col in range(len(hexdata)):
##         print '    def _column_%d(self, d):' % (col,)
##         print '        d.append([])'
##         for row in range(len(hexdata[col])):
##             print '        d[%d].append(%s)' % \
##                   (col, make_drhex_string(hexdata[col][row]))

class Dr25HexData:
    def get_data(self):
        hexdata = []
        for i in range(35):
            eval('self._column_'+str(i)+'(hexdata)')
        return hexdata

    def _column_0(self, d):
        d.append([])
        d[0].append(Dr25Hex((0,0), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[0].append(Dr25Hex((0,1), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[0].append(Dr25Hex((0,2), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[0].append(Dr25Hex((0,3), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[0].append(Dr25Hex((0,4), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[0].append(Dr25Hex((0,5), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[0].append(Dr25Hex((0,6), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[0].append(Dr25Hex((0,7), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[0].append(Dr25Hex((0,8), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[0].append(Dr25Hex((0,9), names.Stump_Hole, Dr25Hex.SCENIC, None, 0))
        d[0].append(Dr25Hex((0,10), None, Dr25Hex.HILL, None, 0))
        d[0].append(Dr25Hex((0,11), None, 0, None, 0))
        d[0].append(Dr25Hex((0,12), None, Dr25Hex.SEASHORE, None, 0))
        d[0].append(Dr25Hex((0,13), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,14), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,15), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,16), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,17), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,18), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,19), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,20), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,21), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,22), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,23), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,24), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,25), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,26), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,27), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,28), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,29), None, Dr25Hex.SEA, None, 0))
        d[0].append(Dr25Hex((0,30), None, Dr25Hex.SEA, None, 0))
    def _column_1(self, d):
        d.append([])
        d[1].append(Dr25Hex((1,0), names.The_Haven,
                            Dr25Hex.SCENIC|Dr25Hex.FOREST, names.Neuth, 0))
        d[1].append(Dr25Hex((1,1), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[1].append(Dr25Hex((1,2), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[1].append(Dr25Hex((1,3), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[1].append(Dr25Hex((1,4), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[1].append(Dr25Hex((1,5), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[1].append(Dr25Hex((1,6), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[1].append(Dr25Hex((1,7), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[1].append(Dr25Hex((1,8), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[1].append(Dr25Hex((1,9), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[1].append(Dr25Hex((1,10), None, Dr25Hex.HILL, None, 0))
        d[1].append(Dr25Hex((1,11), None, Dr25Hex.HILL, None, 0))
        d[1].append(Dr25Hex((1,12), None, Dr25Hex.SEASHORE, None, 0))
        d[1].append(Dr25Hex((1,13), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,14), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,15), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,16), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,17), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,18), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,19), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,20), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,21), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,22), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,23), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,24), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,25), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,26), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,27), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,28), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,29), None, Dr25Hex.SEA, None, 0))
        d[1].append(Dr25Hex((1,30), None, Dr25Hex.SEA, None, 0))
    def _column_2(self, d):
        d.append([])
        d[2].append(Dr25Hex((2,0), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[2].append(Dr25Hex((2,1), 'Aws Noir', Dr25Hex.CASTLE, names.Ghem, 4))
        d[2].append(Dr25Hex((2,2), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[2].append(Dr25Hex((2,3), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[2].append(Dr25Hex((2,4), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[2].append(Dr25Hex((2,5), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[2].append(Dr25Hex((2,6), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                          names.Neuth, 0))
        d[2].append(Dr25Hex((2,7), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[2].append(Dr25Hex((2,8), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[2].append(Dr25Hex((2,9), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[2].append(Dr25Hex((2,10), None, Dr25Hex.HILL, None, 0))
        d[2].append(Dr25Hex((2,11), None, Dr25Hex.HILL, None, 0))
        d[2].append(Dr25Hex((2,12), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[2].append(Dr25Hex((2,13), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,14), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,15), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,16), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,17), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,18), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,19), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,20), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,21), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,22), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,23), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,24), names.Isle_of_Fright, 0, None, 0))
        d[2].append(Dr25Hex((2,25), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,26), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,27), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,28), None, Dr25Hex.SEA, None, 0))
        d[2].append(Dr25Hex((2,29), 'Thores', Dr25Hex.PORT, names.Rombune, 3))
        d[2].append(Dr25Hex((2,30), None, Dr25Hex.SEA, None, 0))
    def _column_3(self, d):
        d.append([])
        d[3].append(Dr25Hex((3,0), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[3].append(Dr25Hex((3,1), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[3].append(Dr25Hex((3,2), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[3].append(Dr25Hex((3,3), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[3].append(Dr25Hex((3,4), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[3].append(Dr25Hex((3,5), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                          names.Neuth, 0))
        d[3].append(Dr25Hex((3,6), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                          names.Neuth, 0))
        d[3].append(Dr25Hex((3,7), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[3].append(Dr25Hex((3,8), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[3].append(Dr25Hex((3,9), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[3].append(Dr25Hex((3,10), None, Dr25Hex.HILL|Dr25Hex.RIVER, None, 0))
        d[3].append(Dr25Hex((3,11), None, 0, None, 0))
        d[3].append(Dr25Hex((3,12), 'Addat', Dr25Hex.PORT, names.Mivior, 3))
        d[3].append(Dr25Hex((3,13), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[3].append(Dr25Hex((3,14), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,15), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,16), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,17), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,18), 'Boliske', Dr25Hex.PORT, names.Mivior, 2))
        d[3].append(Dr25Hex((3,19), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,20), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,21), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[3].append(Dr25Hex((3,22), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,23), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,24), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,25), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,26), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,27), None, Dr25Hex.SEASHORE, names.Rombune, 0))
        d[3].append(Dr25Hex((3,28), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,29), None, Dr25Hex.SEA, None, 0))
        d[3].append(Dr25Hex((3,30), None, Dr25Hex.SEA, None, 0))
    def _column_4(self, d):
        d.append([])
        d[4].append(Dr25Hex((4,0), None, Dr25Hex.HILL, None, 0))
        d[4].append(Dr25Hex((4,1), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[4].append(Dr25Hex((4,2), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[4].append(Dr25Hex((4,3), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[4].append(Dr25Hex((4,4), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[4].append(Dr25Hex((4,5), 'Ider Bolis', Dr25Hex.CASTLE|Dr25Hex.ROYAL,
                          names.Neuth, 5))
        d[4].append(Dr25Hex((4,6), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                          names.Neuth, 0))
        d[4].append(Dr25Hex((4,7), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                          names.Neuth, 0))
        d[4].append(Dr25Hex((4,8), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[4].append(Dr25Hex((4,9), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[4].append(Dr25Hex((4,10), None, Dr25Hex.HILL|Dr25Hex.RIVER, None, 0))
        d[4].append(Dr25Hex((4,11), None, Dr25Hex.RIVER, names.Mivior, 0))
        d[4].append(Dr25Hex((4,12), None, Dr25Hex.RIVER, names.Mivior, 0))
        d[4].append(Dr25Hex((4,13), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[4].append(Dr25Hex((4,14), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[4].append(Dr25Hex((4,15), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[4].append(Dr25Hex((4,16), None, Dr25Hex.SEA, None, 0))
        d[4].append(Dr25Hex((4,17), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                          names.Mivior, 0))
        d[4].append(Dr25Hex((4,18), None, Dr25Hex.SEA, None, 0))
        d[4].append(Dr25Hex((4,19), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                          names.Mivior, 0))
        d[4].append(Dr25Hex((4,20), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                          names.Mivior, 0))
        d[4].append(Dr25Hex((4,21), 'Colist', Dr25Hex.PORT|Dr25Hex.ROYAL,
                          names.Mivior, 4))
        d[4].append(Dr25Hex((4,22), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[4].append(Dr25Hex((4,23), None, Dr25Hex.SEA, None, 0))
        d[4].append(Dr25Hex((4,24), None, Dr25Hex.SEA, None, 0))
        d[4].append(Dr25Hex((4,25), None, Dr25Hex.SEA, None, 0))
        d[4].append(Dr25Hex((4,26), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                          names.Rombune, 0))
        d[4].append(Dr25Hex((4,27), None, Dr25Hex.FOREST|Dr25Hex.MOUNTAIN,
                          names.Rombune, 0))
        d[4].append(Dr25Hex((4,28), None, Dr25Hex.SEASHORE, names.Rombune, 0))
        d[4].append(Dr25Hex((4,29), None, Dr25Hex.SEASHORE, names.Rombune, 0))
        d[4].append(Dr25Hex((4,30), None, Dr25Hex.SEA, None, 0))
    def _column_5(self, d):
        d.append([])
        d[5].append(Dr25Hex((5,0), None, Dr25Hex.HILL, None, 0))
        d[5].append(Dr25Hex((5,1), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[5].append(Dr25Hex((5,2), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[5].append(Dr25Hex((5,3), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[5].append(Dr25Hex((5,4), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[5].append(Dr25Hex((5,5), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[5].append(Dr25Hex((5,6), None, Dr25Hex.LAKE, names.Neuth, 0))
        d[5].append(Dr25Hex((5,7), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                          names.Neuth, 0))
        d[5].append(Dr25Hex((5,8), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[5].append(Dr25Hex((5,9), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[5].append(Dr25Hex((5,10), None, Dr25Hex.SWAMP|Dr25Hex.RIVER, None,
                            0))
        d[5].append(Dr25Hex((5,11), None, Dr25Hex.RIVER, None, 0))
        d[5].append(Dr25Hex((5,12), None, Dr25Hex.RIVER, names.Mivior, 0))
        d[5].append(Dr25Hex((5,13), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                          None, 0))
        d[5].append(Dr25Hex((5,14), 'Serpent Bay', Dr25Hex.SCENIC|Dr25Hex.SEA,
                          None, 0))
        d[5].append(Dr25Hex((5,15), None, Dr25Hex.MOUNTAIN|Dr25Hex.SEASHORE,
                          names.Mivior, 0))
        d[5].append(Dr25Hex((5,16), 'Boran', Dr25Hex.PORT, names.Mivior, 2))
        d[5].append(Dr25Hex((5,17), None, Dr25Hex.MOUNTAIN, names.Mivior, 0))
        d[5].append(Dr25Hex((5,18), None, Dr25Hex.MOUNTAIN|Dr25Hex.SEASHORE,
                          names.Mivior, 0))
        d[5].append(Dr25Hex((5,19), None, Dr25Hex.MOUNTAIN, names.Mivior, 0))
        d[5].append(Dr25Hex((5,20), None, Dr25Hex.MOUNTAIN|Dr25Hex.SEASHORE,
                          names.Mivior, 0))
        d[5].append(Dr25Hex((5,21), None, Dr25Hex.SEA, None, 0))
        d[5].append(Dr25Hex((5,22), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[5].append(Dr25Hex((5,23), None, Dr25Hex.SEA, None, 0))
        d[5].append(Dr25Hex((5,24), None, Dr25Hex.SEA, None, 0))
        d[5].append(Dr25Hex((5,25), None, Dr25Hex.SEA, None, 0))
        d[5].append(Dr25Hex((5,26), None, Dr25Hex.SEASHORE, names.Rombune, 0))
        d[5].append(Dr25Hex((5,27), 'The Golkus', Dr25Hex.PORT|Dr25Hex.ROYAL,
                          names.Rombune, 3))
        d[5].append(Dr25Hex((5,28), None, Dr25Hex.MOUNTAIN, names.Rombune, 0))
        d[5].append(Dr25Hex((5,29), None, Dr25Hex.SEASHORE, names.Rombune, 0))
        d[5].append(Dr25Hex((5,30), None, Dr25Hex.SEASHORE, names.Rombune, 0))
    def _column_6(self, d):
        d.append([])
        d[6].append(Dr25Hex((6,0), None, 0, None, 0))
        d[6].append(Dr25Hex((6,1), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[6].append(Dr25Hex((6,2), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[6].append(Dr25Hex((6,3), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[6].append(Dr25Hex((6,4), names.Ruins_of_Letho,
                            Dr25Hex.SWAMP|Dr25Hex.SCENIC, names.Neuth, 0))
        d[6].append(Dr25Hex((6,5), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[6].append(Dr25Hex((6,6), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                          names.Neuth, 0))
        d[6].append(Dr25Hex((6,7), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                          names.Neuth, 0))
        d[6].append(Dr25Hex((6,8), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[6].append(Dr25Hex((6,9), None, Dr25Hex.SWAMP|Dr25Hex.RIVER, None, 0))
        d[6].append(Dr25Hex((6,10), None, Dr25Hex.SWAMP|Dr25Hex.RIVER, None,
                            0))
        d[6].append(Dr25Hex((6,11), None, Dr25Hex.SWAMP, None, 0))
        d[6].append(Dr25Hex((6,12), None, Dr25Hex.FOREST, None, 0))
        d[6].append(Dr25Hex((6,13), 'The Face', 0, names.Trolls, 0))
        d[6].append(Dr25Hex((6,14), None, Dr25Hex.MOUNTAIN|Dr25Hex.SEASHORE,
                          None, 0))
        d[6].append(Dr25Hex((6,15), None, Dr25Hex.MOUNTAIN, names.Mivior, 0))
        d[6].append(Dr25Hex((6,16), None, Dr25Hex.MOUNTAIN, names.Mivior, 0))
        d[6].append(Dr25Hex((6,17), None, Dr25Hex.MOUNTAIN, names.Mivior, 0))
        d[6].append(Dr25Hex((6,18), None, 0, names.Mivior, 0))
        d[6].append(Dr25Hex((6,19), None, 0, names.Mivior, 0))
        d[6].append(Dr25Hex((6,20), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[6].append(Dr25Hex((6,21), None, Dr25Hex.SEA, None, 0))
        d[6].append(Dr25Hex((6,22), None, Dr25Hex.SEA, None, 0))
        d[6].append(Dr25Hex((6,23), None, Dr25Hex.SEA, None, 0))
        d[6].append(Dr25Hex((6,24), None, Dr25Hex.SEA, None, 0))
        d[6].append(Dr25Hex((6,25), None, Dr25Hex.SEA, None, 0))
        d[6].append(Dr25Hex((6,26), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                          names.Rombune, 0))
        d[6].append(Dr25Hex((6,27), None, Dr25Hex.SEA, None, 0))
        d[6].append(Dr25Hex((6,28), None, Dr25Hex.SEASHORE, names.Rombune, 0))
        d[6].append(Dr25Hex((6,29), None, Dr25Hex.SEASHORE, names.Rombune, 0))
        d[6].append(Dr25Hex((6,30), None, Dr25Hex.SEASHORE, names.Rombune, 0))
    def _column_7(self, d):
        d.append([])
        d[7].append(Dr25Hex((7,0), None, 0, None, 0))
        d[7].append(Dr25Hex((7,1), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[7].append(Dr25Hex((7,2), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[7].append(Dr25Hex((7,3), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[7].append(Dr25Hex((7,4), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[7].append(Dr25Hex((7,5), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[7].append(Dr25Hex((7,6), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                          names.Neuth, 0))
        d[7].append(Dr25Hex((7,7), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                          names.Neuth, 0))
        d[7].append(Dr25Hex((7,8), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[7].append(Dr25Hex((7,9), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[7].append(Dr25Hex((7,10), None, Dr25Hex.SWAMP, None, 0))
        d[7].append(Dr25Hex((7,11), None, Dr25Hex.SWAMP, None, 0))
        d[7].append(Dr25Hex((7,12), None, Dr25Hex.FOREST, None, 0))
        d[7].append(Dr25Hex((7,13), None, Dr25Hex.FOREST, None, 0))
        d[7].append(Dr25Hex((7,14), 'Mace Pass', Dr25Hex.PASS, None, 0))
        d[7].append(Dr25Hex((7,15), None, Dr25Hex.FOREST, names.Hothior, 0))
        d[7].append(Dr25Hex((7,16), None, Dr25Hex.FOREST, names.Hothior, 0))
        d[7].append(Dr25Hex((7,17), None, Dr25Hex.FOREST, names.Hothior, 0))
        d[7].append(Dr25Hex((7,18), None, 0, names.Mivior, 0))
        d[7].append(Dr25Hex((7,19), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[7].append(Dr25Hex((7,20), None, Dr25Hex.SEASHORE, names.Mivior, 0))
        d[7].append(Dr25Hex((7,21), None, Dr25Hex.SEA, None, 0))
        d[7].append(Dr25Hex((7,22), None, Dr25Hex.SEA, None, 0))
        d[7].append(Dr25Hex((7,23), None, Dr25Hex.SEA, None, 0))
        d[7].append(Dr25Hex((7,24), None, Dr25Hex.SEA, None, 0))
        d[7].append(Dr25Hex((7,25), None, Dr25Hex.SEA, None, 0))
        d[7].append(Dr25Hex((7,26), None, Dr25Hex.SEA, None, 0))
        d[7].append(Dr25Hex((7,27), 'Point Lookout',
                            Dr25Hex.SEASHORE|Dr25Hex.SCENIC, names.Rombune, 0))
        d[7].append(Dr25Hex((7,28), None, Dr25Hex.SEASHORE, names.Rombune, 0))
        d[7].append(Dr25Hex((7,29), None, 0, names.Rombune, 0))
        d[7].append(Dr25Hex((7,30), None, 0, names.Rombune, 0))
    def _column_8(self, d):
        d.append([])
        d[8].append(Dr25Hex((8,0), 'Standing Stones', Dr25Hex.SCENIC, None, 0))
        d[8].append(Dr25Hex((8,1), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[8].append(Dr25Hex((8,2), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[8].append(Dr25Hex((8,3), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[8].append(Dr25Hex((8,4), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[8].append(Dr25Hex((8,5), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[8].append(Dr25Hex((8,6), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[8].append(Dr25Hex((8,7), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[8].append(Dr25Hex((8,8), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[8].append(Dr25Hex((8,9), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[8].append(Dr25Hex((8,10), None, Dr25Hex.SWAMP, None, 0))
        d[8].append(Dr25Hex((8,11), 'Willowik', Dr25Hex.SWAMP|Dr25Hex.SCENIC,
                          None, 0))
        d[8].append(Dr25Hex((8,12), None, Dr25Hex.FOREST, None, 0))
        d[8].append(Dr25Hex((8,13), None, Dr25Hex.MOUNTAIN, None, 0))
        d[8].append(Dr25Hex((8,14), None, Dr25Hex.MOUNTAIN, None, 0))
        d[8].append(Dr25Hex((8,15), None, Dr25Hex.FOREST, names.Hothior, 0))
        d[8].append(Dr25Hex((8,16), None, Dr25Hex.FOREST, names.Hothior, 0))
        d[8].append(Dr25Hex((8,17), None, Dr25Hex.FOREST, names.Hothior, 0))
        d[8].append(Dr25Hex((8,18), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                          names.Hothior, 0))
        d[8].append(Dr25Hex((8,19), None, Dr25Hex.SEASHORE, names.Hothior, 0))
        d[8].append(Dr25Hex((8,20), None, Dr25Hex.SEASHORE, names.Hothior, 0))
        d[8].append(Dr25Hex((8,21), None, Dr25Hex.SEA, None, 0))
        d[8].append(Dr25Hex((8,22), None, Dr25Hex.SEA, None, 0))
        d[8].append(Dr25Hex((8,23), None, Dr25Hex.SEA, None, 0))
        d[8].append(Dr25Hex((8,24), None, Dr25Hex.SEA, None, 0))
        d[8].append(Dr25Hex((8,25), None, Dr25Hex.SEA, None, 0))
        d[8].append(Dr25Hex((8,26), None, Dr25Hex.SEA, None, 0))
        d[8].append(Dr25Hex((8,27), None, Dr25Hex.SEASHORE, names.Rombune, 0))
        d[8].append(Dr25Hex((8,28), None, 0, names.Rombune, 0))
        d[8].append(Dr25Hex((8,29), None, 0, names.Rombune, 0))
        d[8].append(Dr25Hex((8,30), None, 0, names.Rombune, 0))
    def _column_9(self, d):
        d.append([])
        d[9].append(Dr25Hex((9,0), None, 0, None, 0))
        d[9].append(Dr25Hex((9,1), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[9].append(Dr25Hex((9,2), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                            names.Neuth, 0))
        d[9].append(Dr25Hex((9,3), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[9].append(Dr25Hex((9,4), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[9].append(Dr25Hex((9,5), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[9].append(Dr25Hex((9,6), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[9].append(Dr25Hex((9,7), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[9].append(Dr25Hex((9,8), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[9].append(Dr25Hex((9,9), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[9].append(Dr25Hex((9,10), None, Dr25Hex.SWAMP|Dr25Hex.RIVER, None,
                            0))
        d[9].append(Dr25Hex((9,11), None, Dr25Hex.HILL, None, 0))
        d[9].append(Dr25Hex((9,12), None, 0, None, 0))
        d[9].append(Dr25Hex((9,13), None, Dr25Hex.HILL, None, 0))
        d[9].append(Dr25Hex((9,14), None, 0, names.Hothior, 0))
        d[9].append(Dr25Hex((9,15), None, 0, names.Hothior, 0))
        d[9].append(Dr25Hex((9,16), None, 0, names.Hothior, 0))
        d[9].append(Dr25Hex((9,17), 'Port Lork', Dr25Hex.PORT|Dr25Hex.ROYAL,
                          names.Hothior, 3))
        d[9].append(Dr25Hex((9,18), 'The Boom',
                            Dr25Hex.SEASHORE|Dr25Hex.SCENIC, names.Hothior, 0))
        d[9].append(Dr25Hex((9,19), None, 0, names.Hothior, 0))
        d[9].append(Dr25Hex((9,20), None, Dr25Hex.SEASHORE, names.Hothior, 0))
        d[9].append(Dr25Hex((9,21), None, Dr25Hex.SEA, None, 0))
        d[9].append(Dr25Hex((9,22), None, Dr25Hex.SEA, None, 0))
        d[9].append(Dr25Hex((9,23), None, Dr25Hex.SEA, None, 0))
        d[9].append(Dr25Hex((9,24), None, Dr25Hex.SEA, None, 0))
        d[9].append(Dr25Hex((9,25), None, Dr25Hex.SEA, None, 0))
        d[9].append(Dr25Hex((9,26), None, Dr25Hex.SEA, None, 0))
        d[9].append(Dr25Hex((9,27), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                          names.Rombune, 0))
        d[9].append(Dr25Hex((9,28), None, Dr25Hex.FOREST, names.Rombune, 0))
        d[9].append(Dr25Hex((9,29), None, 0, names.Rombune, 0))
        d[9].append(Dr25Hex((9,30), None, 0, names.Rombune, 0))
    def _column_10(self, d):
        d.append([])
        d[10].append(Dr25Hex((10,0), None, 0, None, 0))
        d[10].append(Dr25Hex((10,1), None, Dr25Hex.HILL, None, 0))
        d[10].append(Dr25Hex((10,2), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                           names.Neuth, 0))
        d[10].append(Dr25Hex((10,3), None, Dr25Hex.HILL, None, 0))
        d[10].append(Dr25Hex((10,4), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[10].append(Dr25Hex((10,5), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[10].append(Dr25Hex((10,6), None, Dr25Hex.FOREST, names.Neuth, 0))
        d[10].append(Dr25Hex((10,7), None, 0, None, 0))
        d[10].append(Dr25Hex((10,8), None, Dr25Hex.HILL, None, 0))
        d[10].append(Dr25Hex((10,9), None, Dr25Hex.HILL, None, 0))
        d[10].append(Dr25Hex((10,10), None, Dr25Hex.HILL, None, 0))
        d[10].append(Dr25Hex((10,11), None, Dr25Hex.MOUNTAIN, None, 0))
        d[10].append(Dr25Hex((10,12), None, Dr25Hex.HILL, None, 0))
        d[10].append(Dr25Hex((10,13), None, Dr25Hex.HILL|Dr25Hex.RIVER, None,
                             0))
        d[10].append(Dr25Hex((10,14), 'Tadafat', Dr25Hex.CASTLE, names.Hothior,
                             2))
        d[10].append(Dr25Hex((10,15), None, Dr25Hex.RIVER, names.Hothior, 0))
        d[10].append(Dr25Hex((10,16), None, 0, names.Hothior, 0))
        d[10].append(Dr25Hex((10,17), None, Dr25Hex.RIVER, names.Hothior, 0))
        d[10].append(Dr25Hex((10,18), None, Dr25Hex.RIVER, names.Hothior, 0))
        d[10].append(Dr25Hex((10,19), 'Farnot',
                             Dr25Hex.SEASHORE|Dr25Hex.SCENIC, names.Hothior,0))
        d[10].append(Dr25Hex((10,20), None, Dr25Hex.SEASHORE, names.Hothior,0))
        d[10].append(Dr25Hex((10,21), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[10].append(Dr25Hex((10,22), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[10].append(Dr25Hex((10,23), None, Dr25Hex.SEA, None, 0))
        d[10].append(Dr25Hex((10,24), None, Dr25Hex.SEA, None, 0))
        d[10].append(Dr25Hex((10,25), None, Dr25Hex.SEASHORE, None, 0))
        d[10].append(Dr25Hex((10,26), None, Dr25Hex.SEASHORE, None, 0))
        d[10].append(Dr25Hex((10,27), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                           names.Rombune, 0))
        d[10].append(Dr25Hex((10,28), None, Dr25Hex.SEASHORE, names.Rombune,0))
        d[10].append(Dr25Hex((10,29), None, Dr25Hex.HILL|Dr25Hex.SEASHORE,
                           names.Rombune, 0))
        d[10].append(Dr25Hex((10,30), None, 0, names.Rombune, 0))
    def _column_11(self, d):
        d.append([])
        d[11].append(Dr25Hex((11,0), None, Dr25Hex.RIVER, None, 0))
        d[11].append(Dr25Hex((11,1), None, Dr25Hex.RIVER, None, 0))
        d[11].append(Dr25Hex((11,2), None, Dr25Hex.RIVER, None, 0))
        d[11].append(Dr25Hex((11,3), None, Dr25Hex.HILL, None, 0))
        d[11].append(Dr25Hex((11,4), 'The Unknown Army',
                           Dr25Hex.ANCIENT_BATTLEFIELD, None, 0))
        d[11].append(Dr25Hex((11,5), None, 0, None, 0))
        d[11].append(Dr25Hex((11,6), None, Dr25Hex.FOREST, None, 0))
        d[11].append(Dr25Hex((11,7), None, 0, names.Immer, 0))
        d[11].append(Dr25Hex((11,8), None, Dr25Hex.SWAMP, names.Immer, 0))
        d[11].append(Dr25Hex((11,9), None, Dr25Hex.HILL, None, 0))
        d[11].append(Dr25Hex((11,10), None, 0, None, 0))
        d[11].append(Dr25Hex((11,11), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           None, 0))
        d[11].append(Dr25Hex((11,12), None, Dr25Hex.HILL|Dr25Hex.RIVER, None,
                             0))
        d[11].append(Dr25Hex((11,13), None, 0, names.Hothior, 0))
        d[11].append(Dr25Hex((11,14), None, Dr25Hex.HILL|Dr25Hex.RIVER,
                           names.Hothior, 0))
        d[11].append(Dr25Hex((11,15), None, Dr25Hex.HILL, names.Hothior, 0))
        d[11].append(Dr25Hex((11,16), None, Dr25Hex.RIVER, names.Hothior, 0))
        d[11].append(Dr25Hex((11,17), None, 0, names.Hothior, 0))
        d[11].append(Dr25Hex((11,18), None, 0, names.Hothior, 0))
        d[11].append(Dr25Hex((11,19), None, Dr25Hex.SEASHORE, names.Hothior,0))
        d[11].append(Dr25Hex((11,20), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                           names.Shucassam, 0))
        d[11].append(Dr25Hex((11,21), None, 0, names.Shucassam, 0))
        d[11].append(Dr25Hex((11,22), 'Zefnar', Dr25Hex.PORT, names.Shucassam,
                             3))
        d[11].append(Dr25Hex((11,23), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[11].append(Dr25Hex((11,24), None, Dr25Hex.SEASHORE, None, 0))
        d[11].append(Dr25Hex((11,25), names.Tombs_of_Olde, Dr25Hex.SCENIC,
                             None, 0))
        d[11].append(Dr25Hex((11,26), None, Dr25Hex.SEASHORE, None, 0))
        d[11].append(Dr25Hex((11,27), None, Dr25Hex.HILL|Dr25Hex.SEASHORE,
                           names.Rombune, 0))
        d[11].append(Dr25Hex((11,28), 'Parros', Dr25Hex.PORT, names.Rombune,3))
        d[11].append(Dr25Hex((11,29), None, Dr25Hex.HILL|Dr25Hex.SEASHORE,
                           names.Rombune, 0))
        d[11].append(Dr25Hex((11,30), None, 0, names.Rombune, 0))
    def _column_12(self, d):
        d.append([])
        d[12].append(Dr25Hex((12,0), None, 0, None, 0))
        d[12].append(Dr25Hex((12,1), None, Dr25Hex.RIVER, None, 0))
        d[12].append(Dr25Hex((12,2), None, Dr25Hex.HILL, None, 0))
        d[12].append(Dr25Hex((12,3), 'Wirzor', Dr25Hex.CASTLE, names.Immer, 2))
        d[12].append(Dr25Hex((12,4), None, Dr25Hex.HILL, names.Immer, 0))
        d[12].append(Dr25Hex((12,5), None, Dr25Hex.HILL, names.Immer, 0))
        d[12].append(Dr25Hex((12,6), None, 0, names.Immer, 0))
        d[12].append(Dr25Hex((12,7), None, 0, names.Immer, 0))
        d[12].append(Dr25Hex((12,8), None, Dr25Hex.SWAMP, names.Immer, 0))
        d[12].append(Dr25Hex((12,9), None, Dr25Hex.HILL|Dr25Hex.LAKESHORE,
                           None, 0))
        d[12].append(Dr25Hex((12,10), names.Invisible_School,
                           Dr25Hex.CASTLE|Dr25Hex.ROYAL,
                           names.Eaters_of_Wisdom, 5))
        d[12].append(Dr25Hex((12,11), None, Dr25Hex.FOREST|Dr25Hex.LAKESHORE,
                           None, 0))
        d[12].append(Dr25Hex((12,12), None, 0, None, 0))
        d[12].append(Dr25Hex((12,13), None, Dr25Hex.FOREST, None, 0))
        d[12].append(Dr25Hex((12,14), None, 0, names.Hothior, 0))
        d[12].append(Dr25Hex((12,15), None, Dr25Hex.RIVER, names.Hothior, 0))
        d[12].append(Dr25Hex((12,16), None, Dr25Hex.RIVER, names.Hothior, 0))
        d[12].append(Dr25Hex((12,17), None, 0, names.Hothior, 0))
        d[12].append(Dr25Hex((12,18), None, Dr25Hex.SEASHORE, names.Hothior,0))
        d[12].append(Dr25Hex((12,19), None, Dr25Hex.SEA, None, 0))
        d[12].append(Dr25Hex((12,20), None, Dr25Hex.FOREST|Dr25Hex.SEASHORE,
                           names.Shucassam, 0))
        d[12].append(Dr25Hex((12,21), None, 0, names.Shucassam, 0))
        d[12].append(Dr25Hex((12,22), None, 0, names.Shucassam, 0))
        d[12].append(Dr25Hex((12,23), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[12].append(Dr25Hex((12,24), None, Dr25Hex.FOREST, names.Shucassam,0))
        d[12].append(Dr25Hex((12,25), None, 0, None, 0))
        d[12].append(Dr25Hex((12,26), None, 0, None, 0))
        d[12].append(Dr25Hex((12,27), None, Dr25Hex.FOREST, names.Rombune, 0))
        d[12].append(Dr25Hex((12,28), None, Dr25Hex.HILL|Dr25Hex.SEASHORE,
                           names.Rombune, 0))
        d[12].append(Dr25Hex((12,29), 'The Crater',
                             Dr25Hex.SCENIC|Dr25Hex.HILL, names.Rombune, 0))
        d[12].append(Dr25Hex((12,30), None, 0, names.Rombune, 0))
    def _column_13(self, d):
        d.append([])
        d[13].append(Dr25Hex((13,0), None, 0, None, 0))
        d[13].append(Dr25Hex((13,1), None, Dr25Hex.RIVER, names.Immer, 0))
        d[13].append(Dr25Hex((13,2), None, Dr25Hex.RIVER, names.Immer, 0))
        d[13].append(Dr25Hex((13,3), None, 0, names.Immer, 0))
        d[13].append(Dr25Hex((13,4), None, 0, names.Immer, 0))
        d[13].append(Dr25Hex((13,5), None, Dr25Hex.HILL, names.Immer, 0))
        d[13].append(Dr25Hex((13,6), None, 0, names.Immer, 0))
        d[13].append(Dr25Hex((13,7), None, 0, names.Immer, 0))
        d[13].append(Dr25Hex((13,8), None, Dr25Hex.SWAMP, names.Immer, 0))
        d[13].append(Dr25Hex((13,9), None, Dr25Hex.HILL|Dr25Hex.LAKESHORE,
                           None, 0))
        d[13].append(Dr25Hex((13,10), None, Dr25Hex.LAKE, None, 0))
        d[13].append(Dr25Hex((13,11), None,
                           Dr25Hex.FOREST|Dr25Hex.RIVER|Dr25Hex.LAKESHORE,
                           None, 0))
        d[13].append(Dr25Hex((13,12), None, Dr25Hex.FOREST, None, 0))
        d[13].append(Dr25Hex((13,13), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                           None, 0))
        d[13].append(Dr25Hex((13,14), None, Dr25Hex.RIVER, names.Hothior, 0))
        d[13].append(Dr25Hex((13,15), None, 0, names.Hothior, 0))
        d[13].append(Dr25Hex((13,16), None, Dr25Hex.FOREST, names.Hothior, 0))
        d[13].append(Dr25Hex((13,17), None, 0, names.Hothior, 0))
        d[13].append(Dr25Hex((13,18), 'Castle Lapspell', Dr25Hex.PORT,
                           names.Hothior, 3))
        d[13].append(Dr25Hex((13,19), None, Dr25Hex.SEASHORE, None, 0))
        d[13].append(Dr25Hex((13,20), 'Freeport', Dr25Hex.NON_CASTLE_PORT,
                           None, 0))
        d[13].append(Dr25Hex((13,21), None, Dr25Hex.HILL, None, 0))
        d[13].append(Dr25Hex((13,22), None, 0, names.Shucassam, 0))
        d[13].append(Dr25Hex((13,23), None, 0, None, 0))
        d[13].append(Dr25Hex((13,24), None, 0, None, 0))
        d[13].append(Dr25Hex((13,25), None, 0, None, 0))
        d[13].append(Dr25Hex((13,26), None, 0, None, 0))
        d[13].append(Dr25Hex((13,27), None, 0, None, 0))
        d[13].append(Dr25Hex((13,28), None, Dr25Hex.HILL, names.Rombune, 0))
        d[13].append(Dr25Hex((13,29), None, 0, names.Rombune, 0))
        d[13].append(Dr25Hex((13,30), None, 0, names.Rombune, 0))
    def _column_14(self, d):
        d.append([])
        d[14].append(Dr25Hex((14,0), None, 0, None, 0))
        d[14].append(Dr25Hex((14,1), None, Dr25Hex.RIVER, names.Immer, 0))
        d[14].append(Dr25Hex((14,2), None, Dr25Hex.FOREST, names.Immer, 0))
        d[14].append(Dr25Hex((14,3), None, Dr25Hex.FOREST, names.Immer, 0))
        d[14].append(Dr25Hex((14,4), None, 0, names.Immer, 0))
        d[14].append(Dr25Hex((14,5), None, Dr25Hex.HILL, names.Immer, 0))
        d[14].append(Dr25Hex((14,6), 'Castle Altarr',
                             Dr25Hex.CASTLE|Dr25Hex.ROYAL, names.Immer, 3))
        d[14].append(Dr25Hex((14,7), None, 0, names.Immer, 0))
        d[14].append(Dr25Hex((14,8), None, 0, names.Immer, 0))
        d[14].append(Dr25Hex((14,9), None, Dr25Hex.FOREST, None, 0))
        d[14].append(Dr25Hex((14,10), None, Dr25Hex.SWAMP|Dr25Hex.LAKESHORE,
                           None, 0))
        d[14].append(Dr25Hex((14,11), 'Camptown',
                             Dr25Hex.SCENIC|Dr25Hex.FOREST, None, 0))
        d[14].append(Dr25Hex((14,12), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                           None, 0))
        d[14].append(Dr25Hex((14,13), None, Dr25Hex.FOREST, None, 0))
        d[14].append(Dr25Hex((14,14), None, 0, None, 0))
        d[14].append(Dr25Hex((14,15), None, 0, None, 0))
        d[14].append(Dr25Hex((14,16), None, 0, names.Hothior, 0))
        d[14].append(Dr25Hex((14,17), None,
                           Dr25Hex.SWAMP|Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Hothior, 0))
        d[14].append(Dr25Hex((14,18), None, Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Hothior, 0))
        d[14].append(Dr25Hex((14,19), None,
                           Dr25Hex.HILL|Dr25Hex.RIVER|Dr25Hex.NAVIGABLE, None,
                             0))
        d[14].append(Dr25Hex((14,20), None, Dr25Hex.HILL, None, 0))
        d[14].append(Dr25Hex((14,21), None, 0, None, 0))
        d[14].append(Dr25Hex((14,22), None, 0, names.Shucassam, 0))
        d[14].append(Dr25Hex((14,23), None, 0, None, 0))
        d[14].append(Dr25Hex((14,24), None, 0, None, 0))
        d[14].append(Dr25Hex((14,25), None, 0, None, 0))
        d[14].append(Dr25Hex((14,26), 'Plain of Bones',
                           Dr25Hex.ANCIENT_BATTLEFIELD, None, 0))
        d[14].append(Dr25Hex((14,27), None, 0, None, 0))
        d[14].append(Dr25Hex((14,28), None, 0, None, 0))
        d[14].append(Dr25Hex((14,29), None, 0, None, 0))
        d[14].append(Dr25Hex((14,30), None, 0, names.Rombune, 0))
    def _column_15(self, d):
        d.append([])
        d[15].append(Dr25Hex((15,0), None, Dr25Hex.MOUNTAIN, None, 0))
        d[15].append(Dr25Hex((15,1), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           None, 0))
        d[15].append(Dr25Hex((15,2), None, Dr25Hex.FOREST, names.Immer, 0))
        d[15].append(Dr25Hex((15,3), 'Gorpin', Dr25Hex.SCENIC|Dr25Hex.FOREST,
                           names.Immer, 0))
        d[15].append(Dr25Hex((15,4), None, Dr25Hex.HILL, names.Immer, 0))
        d[15].append(Dr25Hex((15,5), None, Dr25Hex.HILL, names.Immer, 0))
        d[15].append(Dr25Hex((15,6), None, 0, names.Immer, 0))
        d[15].append(Dr25Hex((15,7), None, 0, names.Immer, 0))
        d[15].append(Dr25Hex((15,8), 'Muscaster', Dr25Hex.CASTLE, names.Immer,
                             3))
        d[15].append(Dr25Hex((15,9), None, Dr25Hex.FOREST, None, 0))
        d[15].append(Dr25Hex((15,10), None, Dr25Hex.FOREST, None, 0))
        d[15].append(Dr25Hex((15,11), None, Dr25Hex.FOREST, None, 0))
        d[15].append(Dr25Hex((15,12), None, Dr25Hex.FOREST, None, 0))
        d[15].append(Dr25Hex((15,13), None, Dr25Hex.HILL, names.Muetar, 0))
        d[15].append(Dr25Hex((15,14), None, Dr25Hex.HILL, names.Muetar, 0))
        d[15].append(Dr25Hex((15,15), None, Dr25Hex.HILL, names.Muetar, 0))
        d[15].append(Dr25Hex((15,16), None, 0, None, 0))
        d[15].append(Dr25Hex((15,17), None,
                           Dr25Hex.SWAMP|Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           None, 0))
        d[15].append(Dr25Hex((15,18), None, Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           None, 0))
        d[15].append(Dr25Hex((15,19), 'Hubbleglum', Dr25Hex.SCENIC, None, 0))
        d[15].append(Dr25Hex((15,20), None, Dr25Hex.HILL, None, 0))
        d[15].append(Dr25Hex((15,21), None, Dr25Hex.FOREST, None, 0))
        d[15].append(Dr25Hex((15,22), None, 0, names.Shucassam, 0))
        d[15].append(Dr25Hex((15,23), None, 0, None, 0))
        d[15].append(Dr25Hex((15,24), None, 0, None, 0))
        d[15].append(Dr25Hex((15,25), None, 0, None, 0))
        d[15].append(Dr25Hex((15,26), None, 0, None, 0))
        d[15].append(Dr25Hex((15,27), None, 0, None, 0))
        d[15].append(Dr25Hex((15,28), None, 0, None, 0))
        d[15].append(Dr25Hex((15,29), None, Dr25Hex.HILL, None, 0))
        d[15].append(Dr25Hex((15,30), None, 0, None, 0))
    def _column_16(self, d):
        d.append([])
        d[16].append(Dr25Hex((16,0), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           None, 0))
        d[16].append(Dr25Hex((16,1), 'The Temple of Kings', Dr25Hex.SCENIC,
                             None, 0))
        d[16].append(Dr25Hex((16,2), None, Dr25Hex.FOREST, names.Immer, 0))
        d[16].append(Dr25Hex((16,3), None, Dr25Hex.FOREST, names.Immer, 0))
        d[16].append(Dr25Hex((16,4), None, Dr25Hex.FOREST, names.Immer, 0))
        d[16].append(Dr25Hex((16,5), None, 0, names.Immer, 0))
        d[16].append(Dr25Hex((16,6), None, 0, names.Immer, 0))
        d[16].append(Dr25Hex((16,7), None, 0, names.Immer, 0))
        d[16].append(Dr25Hex((16,8), None, 0, names.Immer, 0))
        d[16].append(Dr25Hex((16,9), None, 0, names.Immer, 0))
        d[16].append(Dr25Hex((16,10), None, 0, names.Immer, 0))
        d[16].append(Dr25Hex((16,11), None, 0, names.Immer, 0))
        d[16].append(Dr25Hex((16,12), None, 0, None, 0))
        d[16].append(Dr25Hex((16,13), None, 0, names.Muetar, 0))
        d[16].append(Dr25Hex((16,14), None, 0, names.Muetar, 0))
        d[16].append(Dr25Hex((16,15), None, 0, names.Muetar, 0))
        d[16].append(Dr25Hex((16,16), None,
                           Dr25Hex.SWAMP|Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[16].append(Dr25Hex((16,17), None,
                           Dr25Hex.SWAMP|Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[16].append(Dr25Hex((16,18), None, Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           None, 0))
        d[16].append(Dr25Hex((16,19), None, 0, None, 0))
        d[16].append(Dr25Hex((16,20), None, Dr25Hex.HILL, None, 0))
        d[16].append(Dr25Hex((16,21), None, 0, None, 0))
        d[16].append(Dr25Hex((16,22), None, 0, names.Shucassam, 0))
        d[16].append(Dr25Hex((16,23), None, 0, None, 0))
        d[16].append(Dr25Hex((16,24), names.Lost_Caravan, Dr25Hex.SCENIC,
                             None, 0))
        d[16].append(Dr25Hex((16,25), None, 0, None, 0))
        d[16].append(Dr25Hex((16,26), None, 0, None, 0))
        d[16].append(Dr25Hex((16,27), None, Dr25Hex.FOREST, None, 0))
        d[16].append(Dr25Hex((16,28), None, Dr25Hex.FOREST, None, 0))
        d[16].append(Dr25Hex((16,29), None, Dr25Hex.HILL, None, 0))
        d[16].append(Dr25Hex((16,30), None, 0, None, 0))
    def _column_17(self, d):
        d.append([])
        d[17].append(Dr25Hex((17,0), None, Dr25Hex.MOUNTAIN, None, 0))
        d[17].append(Dr25Hex((17,1), None, Dr25Hex.MOUNTAIN, None, 0))
        d[17].append(Dr25Hex((17,2), None, Dr25Hex.MOUNTAIN, None, 0))
        d[17].append(Dr25Hex((17,3), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[17].append(Dr25Hex((17,4), None, Dr25Hex.FOREST, names.Immer, 0))
        d[17].append(Dr25Hex((17,5), None, Dr25Hex.FOREST, names.Immer, 0))
        d[17].append(Dr25Hex((17,6), None, Dr25Hex.FOREST, names.Immer, 0))
        d[17].append(Dr25Hex((17,7), None, 0, names.Immer, 0))
        d[17].append(Dr25Hex((17,8), None, 0, names.Immer, 0))
        d[17].append(Dr25Hex((17,9), None, 0, names.Immer, 0))
        d[17].append(Dr25Hex((17,10), None, 0, names.Immer, 0))
        d[17].append(Dr25Hex((17,11), None, Dr25Hex.SEASHORE, None, 0))
        d[17].append(Dr25Hex((17,12), None, Dr25Hex.SEASHORE, None, 0))
        d[17].append(Dr25Hex((17,13), None, 0, names.Muetar, 0))
        d[17].append(Dr25Hex((17,14), 'Plibba', Dr25Hex.CASTLE, names.Muetar,
                             2))
        d[17].append(Dr25Hex((17,15), None, Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[17].append(Dr25Hex((17,16), None,
                           Dr25Hex.SWAMP|Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[17].append(Dr25Hex((17,17), None,
                           Dr25Hex.SWAMP|Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[17].append(Dr25Hex((17,18), None, 0, None, 0))
        d[17].append(Dr25Hex((17,19), None, 0, None, 0))
        d[17].append(Dr25Hex((17,20), None, 0, None, 0))
        d[17].append(Dr25Hex((17,21), None, 0, None, 0))
        d[17].append(Dr25Hex((17,22), None, 0, names.Shucassam, 0))
        d[17].append(Dr25Hex((17,23), None, 0, None, 0))
        d[17].append(Dr25Hex((17,24), None, 0, None, 0))
        d[17].append(Dr25Hex((17,25), None, 0, None, 0))
        d[17].append(Dr25Hex((17,26), None, 0, None, 0))
        d[17].append(Dr25Hex((17,27), None, Dr25Hex.MOUNTAIN, None, 0))
        d[17].append(Dr25Hex((17,28), 'The Shunned Vale', 0, names.Trolls, 0))
        d[17].append(Dr25Hex((17,29), None, Dr25Hex.MOUNTAIN, None, 0))
        d[17].append(Dr25Hex((17,30), None, 0, None, 0))
    def _column_18(self, d):
        d.append([])
        d[18].append(Dr25Hex((18,0), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[18].append(Dr25Hex((18,1), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[18].append(Dr25Hex((18,2), 'Winter Rest',
                             Dr25Hex.SCENIC|Dr25Hex.MOUNTAIN, None, 0))
        d[18].append(Dr25Hex((18,3), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[18].append(Dr25Hex((18,4), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[18].append(Dr25Hex((18,5), 'Gap Castle', Dr25Hex.CASTLE, names.Immer,
                             2))
        d[18].append(Dr25Hex((18,6), None, 0, names.Immer, 0))
        d[18].append(Dr25Hex((18,7), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[18].append(Dr25Hex((18,8), None, 0, names.Immer, 0))
        d[18].append(Dr25Hex((18,9), None, Dr25Hex.FOREST, None, 0))
        d[18].append(Dr25Hex((18,10), None, Dr25Hex.SEASHORE, None, 0))
        d[18].append(Dr25Hex((18,11), None, Dr25Hex.SEASHORE, names.Muetar, 0))
        d[18].append(Dr25Hex((18,12), None, Dr25Hex.SEASHORE, names.Muetar, 0))
        d[18].append(Dr25Hex((18,13), None, Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[18].append(Dr25Hex((18,14), None, 0, names.Muetar, 0))
        d[18].append(Dr25Hex((18,15), None, Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[18].append(Dr25Hex((18,16), None,
                           Dr25Hex.SWAMP|Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[18].append(Dr25Hex((18,17), None, Dr25Hex.SWAMP, names.Muetar, 0))
        d[18].append(Dr25Hex((18,18), None, 0, None, 0))
        d[18].append(Dr25Hex((18,19), None, 0, None, 0))
        d[18].append(Dr25Hex((18,20), None, 0, None, 0))
        d[18].append(Dr25Hex((18,21), None, 0, None, 0))
        d[18].append(Dr25Hex((18,22), 'The Obelisk', Dr25Hex.SCENIC,
                           names.Shucassam, 0))
        d[18].append(Dr25Hex((18,23), None, 0, names.Shucassam, 0))
        d[18].append(Dr25Hex((18,24), None, 0, None, 0))
        d[18].append(Dr25Hex((18,25), None, Dr25Hex.MOUNTAIN, names.Shucassam,
                             0))
        d[18].append(Dr25Hex((18,26), None, 0, None, 0))
        d[18].append(Dr25Hex((18,27), None, Dr25Hex.MOUNTAIN, None, 0))
        d[18].append(Dr25Hex((18,28), None, Dr25Hex.MOUNTAIN, None, 0))
        d[18].append(Dr25Hex((18,29), None, 0, names.Rombune, 0))
        d[18].append(Dr25Hex((18,30), 'Giant Pass', Dr25Hex.PASS, None, 0))
    def _column_19(self, d):
        d.append([])
        d[19].append(Dr25Hex((19,0), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[19].append(Dr25Hex((19,1), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[19].append(Dr25Hex((19,2), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[19].append(Dr25Hex((19,3), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[19].append(Dr25Hex((19,4), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[19].append(Dr25Hex((19,5), 'Snow Pass', Dr25Hex.PASS, names.Zorn, 0))
        d[19].append(Dr25Hex((19,6), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[19].append(Dr25Hex((19,7), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           names.Zorn, 0))
        d[19].append(Dr25Hex((19,8), None, 0, None, 0))
        d[19].append(Dr25Hex((19,9), None, Dr25Hex.FOREST, None, 0))
        d[19].append(Dr25Hex((19,10), None, Dr25Hex.SEASHORE, None, 0))
        d[19].append(Dr25Hex((19,11), 'Pennol', Dr25Hex.CASTLE|Dr25Hex.ROYAL,
                           names.Muetar, 4))
        d[19].append(Dr25Hex((19,12), None, Dr25Hex.SEASHORE, names.Muetar, 0))
        d[19].append(Dr25Hex((19,13), None, Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[19].append(Dr25Hex((19,14), None, Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[19].append(Dr25Hex((19,15), None,
                           Dr25Hex.FOREST|Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[19].append(Dr25Hex((19,16), 'Yando', Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[19].append(Dr25Hex((19,17), None, Dr25Hex.HILL, names.Muetar, 0))
        d[19].append(Dr25Hex((19,18), None, 0, None, 0))
        d[19].append(Dr25Hex((19,19), None, 0, None, 0))
        d[19].append(Dr25Hex((19,20), None, 0, None, 0))
        d[19].append(Dr25Hex((19,21), None, 0, names.Shucassam, 0))
        d[19].append(Dr25Hex((19,22), None, 0, names.Shucassam, 0))
        d[19].append(Dr25Hex((19,23), 'Kuzdol', Dr25Hex.CASTLE,
                             names.Shucassam, 3))
        d[19].append(Dr25Hex((19,24), None, 0, names.Shucassam, 0))
        d[19].append(Dr25Hex((19,25), None, Dr25Hex.MOUNTAIN, names.Shucassam,
                             0))
        d[19].append(Dr25Hex((19,26), None, Dr25Hex.MOUNTAIN, names.Shucassam,
                             0))
        d[19].append(Dr25Hex((19,27), None, 0, None, 0))
        d[19].append(Dr25Hex((19,28), 'Jipols', Dr25Hex.PORT, names.Rombune,3))
        d[19].append(Dr25Hex((19,29), None, 0, names.Rombune, 0))
        d[19].append(Dr25Hex((19,30), None, 0, None, 0))
    def _column_20(self, d):
        d.append([])
        d[20].append(Dr25Hex((20,0), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[20].append(Dr25Hex((20,1), None, 0, names.Zorn, 0))
        d[20].append(Dr25Hex((20,2), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[20].append(Dr25Hex((20,3), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[20].append(Dr25Hex((20,4), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[20].append(Dr25Hex((20,5), None, 0, names.Zorn, 0))
        d[20].append(Dr25Hex((20,6), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           names.Zorn, 0))
        d[20].append(Dr25Hex((20,7), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           names.Zorn, 0))
        d[20].append(Dr25Hex((20,8), None, 0, None, 0))
        d[20].append(Dr25Hex((20,9), None, 0, None, 0))
        d[20].append(Dr25Hex((20,10), None, Dr25Hex.SEASHORE, names.Muetar, 0))
        d[20].append(Dr25Hex((20,11), None, 0, names.Muetar, 0))
        d[20].append(Dr25Hex((20,12), None, 0, names.Muetar, 0))
        d[20].append(Dr25Hex((20,13), None,
                           Dr25Hex.FOREST|Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[20].append(Dr25Hex((20,14), None, Dr25Hex.RIVER|Dr25Hex.NAVIGABLE,
                           names.Muetar, 0))
        d[20].append(Dr25Hex((20,15), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[20].append(Dr25Hex((20,16), None, 0, names.Muetar, 0))
        d[20].append(Dr25Hex((20,17), None, Dr25Hex.HILL, names.Muetar, 0))
        d[20].append(Dr25Hex((20,18), 'The Keep', Dr25Hex.CASTLE, '', 2))
        d[20].append(Dr25Hex((20,19), None, Dr25Hex.FOREST, None, 0))
        d[20].append(Dr25Hex((20,20), None, 0, None, 0))
        d[20].append(Dr25Hex((20,21), None, 0, names.Shucassam, 0))
        d[20].append(Dr25Hex((20,22), None, 0, names.Shucassam, 0))
        d[20].append(Dr25Hex((20,23), None, Dr25Hex.MOUNTAIN, names.Shucassam,
                             0))
        d[20].append(Dr25Hex((20,24), None, Dr25Hex.MOUNTAIN, names.Shucassam,
                             0))
        d[20].append(Dr25Hex((20,25), None, 0, names.Shucassam, 0))
        d[20].append(Dr25Hex((20,26), None, 0, names.Shucassam, 0))
        d[20].append(Dr25Hex((20,27), None, Dr25Hex.SEASHORE, None, 0))
        d[20].append(Dr25Hex((20,28), None, Dr25Hex.SEASHORE, names.Rombune,0))
        d[20].append(Dr25Hex((20,29), None, 0, None, 0))
        d[20].append(Dr25Hex((20,30), None, 0, None, 0))
    def _column_21(self, d):
        d.append([])
        d[21].append(Dr25Hex((21,0), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[21].append(Dr25Hex((21,1), None, 0, names.Zorn, 0))
        d[21].append(Dr25Hex((21,2), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[21].append(Dr25Hex((21,3), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[21].append(Dr25Hex((21,4), None, 0, names.Zorn, 0))
        d[21].append(Dr25Hex((21,5), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[21].append(Dr25Hex((21,6), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[21].append(Dr25Hex((21,7), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[21].append(Dr25Hex((21,8), None, Dr25Hex.RIVER, None, 0))
        d[21].append(Dr25Hex((21,9), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[21].append(Dr25Hex((21,10), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[21].append(Dr25Hex((21,11), None, 0, names.Muetar, 0))
        d[21].append(Dr25Hex((21,12), None, 0, names.Muetar, 0))
        d[21].append(Dr25Hex((21,13), None, 0, names.Muetar, 0))
        d[21].append(Dr25Hex((21,14), None, 0, names.Muetar, 0))
        d[21].append(Dr25Hex((21,15), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[21].append(Dr25Hex((21,16), 'Beolon', Dr25Hex.CASTLE, names.Muetar,
                             2))
        d[21].append(Dr25Hex((21,17), None, 0, names.Muetar, 0))
        d[21].append(Dr25Hex((21,18), None, Dr25Hex.FOREST, None, 0))
        d[21].append(Dr25Hex((21,19), None, Dr25Hex.FOREST, None, 0))
        d[21].append(Dr25Hex((21,20), None, Dr25Hex.FOREST, names.Shucassam,0))
        d[21].append(Dr25Hex((21,21), None, 0, names.Shucassam, 0))
        d[21].append(Dr25Hex((21,22), None, Dr25Hex.HILL, names.Shucassam, 0))
        d[21].append(Dr25Hex((21,23), None, 0, names.Shucassam, 0))
        d[21].append(Dr25Hex((21,24), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[21].append(Dr25Hex((21,25), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[21].append(Dr25Hex((21,26), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[21].append(Dr25Hex((21,27), None, Dr25Hex.SEASHORE, None, 0))
        d[21].append(Dr25Hex((21,28), None, Dr25Hex.SEASHORE, None, 0))
        d[21].append(Dr25Hex((21,29), None, 0, None, 0))
        d[21].append(Dr25Hex((21,30), None, 0, None, 0))
    def _column_22(self, d):
        d.append([])
        d[22].append(Dr25Hex((22,0), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[22].append(Dr25Hex((22,1), None, 0, names.Zorn, 0))
        d[22].append(Dr25Hex((22,2), None, Dr25Hex.SWAMP, names.Zorn, 0))
        d[22].append(Dr25Hex((22,3), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[22].append(Dr25Hex((22,4), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[22].append(Dr25Hex((22,5), None, Dr25Hex.FOREST|Dr25Hex.MOUNTAIN,
                           names.Zorn, 0))
        d[22].append(Dr25Hex((22,6), 'Ozerg', Dr25Hex.MOUNTAIN|Dr25Hex.SCENIC,
                           None, 0))
        d[22].append(Dr25Hex((22,7), None, Dr25Hex.FOREST, None, 0))
        d[22].append(Dr25Hex((22,8), None, Dr25Hex.RIVER, None, 0))
        d[22].append(Dr25Hex((22,9), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[22].append(Dr25Hex((22,10), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[22].append(Dr25Hex((22,11), None, Dr25Hex.FOREST, names.Muetar, 0))
        d[22].append(Dr25Hex((22,12), None, 0, names.Muetar, 0))
        d[22].append(Dr25Hex((22,13), None, 0, names.Muetar, 0))
        d[22].append(Dr25Hex((22,14), None, 0, names.Muetar, 0))
        d[22].append(Dr25Hex((22,15), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                           names.Muetar, 0))
        d[22].append(Dr25Hex((22,16), None, 0, names.Muetar, 0))
        d[22].append(Dr25Hex((22,17), None, 0, names.Muetar, 0))
        d[22].append(Dr25Hex((22,18), None, Dr25Hex.FOREST, None, 0))
        d[22].append(Dr25Hex((22,19), None, 0, names.Shucassam, 0))
        d[22].append(Dr25Hex((22,20), None, 0, names.Shucassam, 0))
        d[22].append(Dr25Hex((22,21), None, 0, names.Shucassam, 0))
        d[22].append(Dr25Hex((22,22), None, 0, names.Shucassam, 0))
        d[22].append(Dr25Hex((22,23), None, 0, names.Shucassam, 0))
        d[22].append(Dr25Hex((22,24), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[22].append(Dr25Hex((22,25), None, Dr25Hex.SEA, None, 0))
        d[22].append(Dr25Hex((22,26), None, Dr25Hex.SEASHORE, None, 0))
        d[22].append(Dr25Hex((22,27), None, 0, None, 0))
        d[22].append(Dr25Hex((22,28), None, 0, None, 0))
        d[22].append(Dr25Hex((22,29), 'Eerie Oasis', Dr25Hex.SCENIC, None, 0))
        d[22].append(Dr25Hex((22,30), None, 0, None, 0))
    def _column_23(self, d):
        d.append([])
        d[23].append(Dr25Hex((23,0), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[23].append(Dr25Hex((23,1), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[23].append(Dr25Hex((23,2), 'The Pits', Dr25Hex.CASTLE|Dr25Hex.ROYAL,
                           names.Zorn, 5))
        d[23].append(Dr25Hex((23,3), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[23].append(Dr25Hex((23,4), None, 0, names.Zorn, 0))
        d[23].append(Dr25Hex((23,5), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[23].append(Dr25Hex((23,6), None, Dr25Hex.FOREST|Dr25Hex.MOUNTAIN,
                           names.Zorn, 0))
        d[23].append(Dr25Hex((23,7), None, Dr25Hex.FOREST, None, 0))
        d[23].append(Dr25Hex((23,8), None, Dr25Hex.RIVER, None, 0))
        d[23].append(Dr25Hex((23,9), None, 0, names.Muetar, 0))
        d[23].append(Dr25Hex((23,10), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                           names.Muetar, 0))
        d[23].append(Dr25Hex((23,11), None, Dr25Hex.FOREST, names.Muetar, 0))
        d[23].append(Dr25Hex((23,12), None, 0, names.Muetar, 0))
        d[23].append(Dr25Hex((23,13), None, Dr25Hex.HILL, names.Muetar, 0))
        d[23].append(Dr25Hex((23,14), None, Dr25Hex.SWAMP|Dr25Hex.RIVER,
                           names.Muetar, 0))
        d[23].append(Dr25Hex((23,15), 'Groat', Dr25Hex.CASTLE, names.Muetar,3))
        d[23].append(Dr25Hex((23,16), None, Dr25Hex.SWAMP|Dr25Hex.RIVER,
                           names.Muetar, 0))
        d[23].append(Dr25Hex((23,17), None, 0, names.Muetar, 0))
        d[23].append(Dr25Hex((23,18), None, 0, None, 0))
        d[23].append(Dr25Hex((23,19), None, 0, names.Shucassam, 0))
        d[23].append(Dr25Hex((23,20), None, 0, names.Shucassam, 0))
        d[23].append(Dr25Hex((23,21), None, 0, names.Shucassam, 0))
        d[23].append(Dr25Hex((23,22), None, 0, names.Shucassam, 0))
        d[23].append(Dr25Hex((23,23), None, 0, names.Shucassam, 0))
        d[23].append(Dr25Hex((23,24), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[23].append(Dr25Hex((23,25), 'Bartertown', Dr25Hex.NON_CASTLE_PORT,
                           None, 0))
        d[23].append(Dr25Hex((23,26), None, Dr25Hex.SEASHORE, None, 0))
        d[23].append(Dr25Hex((23,27), None, 0, None, 0))
        d[23].append(Dr25Hex((23,28), None, 0, None, 0))
        d[23].append(Dr25Hex((23,29), None, 0, None, 0))
        d[23].append(Dr25Hex((23,30), None, 0, None, 0))
    def _column_24(self, d):
        d.append([])
        d[24].append(Dr25Hex((24,0), None, Dr25Hex.HILL, names.Zorn, 0))
        d[24].append(Dr25Hex((24,1), None, Dr25Hex.HILL, names.Zorn, 0))
        d[24].append(Dr25Hex((24,2), None, 0, names.Zorn, 0))
        d[24].append(Dr25Hex((24,3), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[24].append(Dr25Hex((24,4), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[24].append(Dr25Hex((24,5), None, 0, names.Zorn, 0))
        d[24].append(Dr25Hex((24,6), 'Maw Pass', Dr25Hex.PASS, names.Zorn, 0))
        d[24].append(Dr25Hex((24,7), None, Dr25Hex.MOUNTAIN, None, 0))
        d[24].append(Dr25Hex((24,8), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[24].append(Dr25Hex((24,9), 'Basimar', Dr25Hex.CASTLE, names.Muetar,
                             3))
        d[24].append(Dr25Hex((24,10), None, Dr25Hex.FOREST, names.Muetar, 0))
        d[24].append(Dr25Hex((24,11), None, Dr25Hex.FOREST, names.Muetar, 0))
        d[24].append(Dr25Hex((24,12), None, 0, names.Muetar, 0))
        d[24].append(Dr25Hex((24,13), None, Dr25Hex.HILL, names.Muetar, 0))
        d[24].append(Dr25Hex((24,14), None, Dr25Hex.SWAMP, names.Muetar, 0))
        d[24].append(Dr25Hex((24,15), None, Dr25Hex.SWAMP, names.Muetar, 0))
        d[24].append(Dr25Hex((24,16), None, Dr25Hex.SWAMP, names.Muetar, 0))
        d[24].append(Dr25Hex((24,17), None, Dr25Hex.HILL, names.Muetar, 0))
        d[24].append(Dr25Hex((24,18), None, 0, None, 0))
        d[24].append(Dr25Hex((24,19), None, 0, names.Shucassam, 0))
        d[24].append(Dr25Hex((24,20), None, 0, names.Shucassam, 0))
        d[24].append(Dr25Hex((24,21), None, 0, names.Shucassam, 0))
        d[24].append(Dr25Hex((24,22), None, 0, names.Shucassam, 0))
        d[24].append(Dr25Hex((24,23), 'Adeese', Dr25Hex.PORT|Dr25Hex.ROYAL,
                           names.Shucassam, 4))
        d[24].append(Dr25Hex((24,24), None, Dr25Hex.SEA, None, 0))
        d[24].append(Dr25Hex((24,25), None, Dr25Hex.SEASHORE, None, 0))
        d[24].append(Dr25Hex((24,26), None, 0, None, 0))
        d[24].append(Dr25Hex((24,27), None, 0, None, 0))
        d[24].append(Dr25Hex((24,28), None, 0, None, 0))
        d[24].append(Dr25Hex((24,29), None, 0, None, 0))
        d[24].append(Dr25Hex((24,30), names.Trading_Post, Dr25Hex.SCENIC,
                             None, 0))
    def _column_25(self, d):
        d.append([])
        d[25].append(Dr25Hex((25,0), names.Mounds, Dr25Hex.HILL|Dr25Hex.SCENIC,
                           names.Zorn, 0))
        d[25].append(Dr25Hex((25,1), None, Dr25Hex.HILL, names.Zorn, 0))
        d[25].append(Dr25Hex((25,2), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[25].append(Dr25Hex((25,3), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[25].append(Dr25Hex((25,4), None, Dr25Hex.FOREST, names.Zorn, 0))
        d[25].append(Dr25Hex((25,5), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[25].append(Dr25Hex((25,6), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[25].append(Dr25Hex((25,7), None, Dr25Hex.MOUNTAIN, None, 0))
        d[25].append(Dr25Hex((25,8), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[25].append(Dr25Hex((25,9), None, 0, names.Muetar, 0))
        d[25].append(Dr25Hex((25,10), None, 0, names.Muetar, 0))
        d[25].append(Dr25Hex((25,11), None, 0, names.Muetar, 0))
        d[25].append(Dr25Hex((25,12), None, Dr25Hex.HILL, names.Muetar, 0))
        d[25].append(Dr25Hex((25,13), None, Dr25Hex.FOREST, names.Pon, 0))
        d[25].append(Dr25Hex((25,14), None, Dr25Hex.FOREST, names.Pon, 0))
        d[25].append(Dr25Hex((25,15), None, 0, names.Muetar, 0))
        d[25].append(Dr25Hex((25,16), None, Dr25Hex.HILL, names.Muetar, 0))
        d[25].append(Dr25Hex((25,17), None, Dr25Hex.RIVER, names.Pon, 0))
        d[25].append(Dr25Hex((25,18), 'The Falls of Xag',
                           Dr25Hex.RIVER|Dr25Hex.SCENIC, None, 0))
        d[25].append(Dr25Hex((25,19), None, Dr25Hex.RIVER, names.Shucassam, 0))
        d[25].append(Dr25Hex((25,20), None, Dr25Hex.RIVER, names.Shucassam, 0))
        d[25].append(Dr25Hex((25,21), None, Dr25Hex.RIVER, names.Shucassam, 0))
        d[25].append(Dr25Hex((25,22), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[25].append(Dr25Hex((25,23), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[25].append(Dr25Hex((25,24), None, Dr25Hex.SEA, None, 0))
        d[25].append(Dr25Hex((25,25), None, Dr25Hex.SEA, None, 0))
        d[25].append(Dr25Hex((25,26), None, Dr25Hex.SEASHORE, None, 0))
        d[25].append(Dr25Hex((25,27), 'Hyyx', Dr25Hex.SCENIC, None, 0))
        d[25].append(Dr25Hex((25,28), None, 0, None, 0))
        d[25].append(Dr25Hex((25,29), None, 0, None, 0))
        d[25].append(Dr25Hex((25,30), None, 0, None, 0))
    def _column_26(self, d):
        d.append([])
        d[26].append(Dr25Hex((26,0), None, Dr25Hex.HILL, names.Zorn, 0))
        d[26].append(Dr25Hex((26,1), None, 0, None, 0))
        d[26].append(Dr25Hex((26,2), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[26].append(Dr25Hex((26,3), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[26].append(Dr25Hex((26,4), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[26].append(Dr25Hex((26,5), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[26].append(Dr25Hex((26,6), None, Dr25Hex.FOREST, None, 0))
        d[26].append(Dr25Hex((26,7), None, Dr25Hex.FOREST, None, 0))
        d[26].append(Dr25Hex((26,8), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[26].append(Dr25Hex((26,9), None, Dr25Hex.SWAMP|Dr25Hex.RIVER,
                             names.Muetar, 0))
        d[26].append(Dr25Hex((26,10), None, 0, names.Muetar, 0))
        d[26].append(Dr25Hex((26,11), None, Dr25Hex.FOREST, names.Pon, 0))
        d[26].append(Dr25Hex((26,12), None, Dr25Hex.FOREST, names.Pon, 0))
        d[26].append(Dr25Hex((26,13), 'Crow\'s Nest', Dr25Hex.CASTLE,
                             names.Pon, 4))
        d[26].append(Dr25Hex((26,14), None, Dr25Hex.FOREST, names.Pon, 0))
        d[26].append(Dr25Hex((26,15), None, Dr25Hex.HILL|Dr25Hex.RIVER,
                             names.Pon, 0))
        d[26].append(Dr25Hex((26,16), None, Dr25Hex.HILL|Dr25Hex.RIVER,
                             names.Pon, 0))
        d[26].append(Dr25Hex((26,17), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                             names.Pon, 0))
        d[26].append(Dr25Hex((26,18), None, Dr25Hex.FOREST, names.Pon, 0))
        d[26].append(Dr25Hex((26,19), None, 0, names.Shucassam, 0))
        d[26].append(Dr25Hex((26,20), None, 0, names.Shucassam, 0))
        d[26].append(Dr25Hex((26,21), None, 0, names.Shucassam, 0))
        d[26].append(Dr25Hex((26,22), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[26].append(Dr25Hex((26,23), None, Dr25Hex.SEA, None, 0))
        d[26].append(Dr25Hex((26,24), None, Dr25Hex.SEA, None, 0))
        d[26].append(Dr25Hex((26,25), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[26].append(Dr25Hex((26,26), None, Dr25Hex.SEASHORE, None, 0))
        d[26].append(Dr25Hex((26,27), None, 0, None, 0))
        d[26].append(Dr25Hex((26,28), None, 0, None, 0))
        d[26].append(Dr25Hex((26,29), None, 0, None, 0))
        d[26].append(Dr25Hex((26,30), None, 0, None, 0))
    def _column_27(self, d):
        d.append([])
        d[27].append(Dr25Hex((27,0), None, Dr25Hex.HILL, names.Zorn, 0))
        d[27].append(Dr25Hex((27,1), None, 0, None, 0))
        d[27].append(Dr25Hex((27,2), 'The Crag', 0, names.Trolls, 0))
        d[27].append(Dr25Hex((27,3), None, 0, None, 0))
        d[27].append(Dr25Hex((27,4), None, Dr25Hex.MOUNTAIN, names.Zorn, 0))
        d[27].append(Dr25Hex((27,5), 'Wolf Den', Dr25Hex.SCENIC|Dr25Hex.FOREST,
                           None, 0))
        d[27].append(Dr25Hex((27,6), None, Dr25Hex.FOREST, None, 0))
        d[27].append(Dr25Hex((27,7), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[27].append(Dr25Hex((27,8), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[27].append(Dr25Hex((27,9), None, Dr25Hex.SWAMP|Dr25Hex.RIVER,
                             names.Muetar, 0))
        d[27].append(Dr25Hex((27,10), None, 0, names.Muetar, 0))
        d[27].append(Dr25Hex((27,11), None, Dr25Hex.FOREST, names.Pon, 0))
        d[27].append(Dr25Hex((27,12), None, Dr25Hex.FOREST, names.Pon, 0))
        d[27].append(Dr25Hex((27,13), None, Dr25Hex.FOREST, names.Pon, 0))
        d[27].append(Dr25Hex((27,14), None, Dr25Hex.FOREST|Dr25Hex.RIVER,
                             names.Pon, 0))
        d[27].append(Dr25Hex((27,15), None, Dr25Hex.RIVER, names.Pon, 0))
        d[27].append(Dr25Hex((27,16), None, 0, names.Pon, 0))
        d[27].append(Dr25Hex((27,17), None, Dr25Hex.MOUNTAIN, names.Pon, 0))
        d[27].append(Dr25Hex((27,18), None, Dr25Hex.FOREST, names.Pon, 0))
        d[27].append(Dr25Hex((27,19), None, Dr25Hex.FOREST, names.Pon, 0))
        d[27].append(Dr25Hex((27,20), None, 0, names.Shucassam, 0))
        d[27].append(Dr25Hex((27,21), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[27].append(Dr25Hex((27,22), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[27].append(Dr25Hex((27,23), None, Dr25Hex.SEASHORE, None, 0))
        d[27].append(Dr25Hex((27,24), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[27].append(Dr25Hex((27,25), 'Lepers', 0, names.Shucassam, 0))
        d[27].append(Dr25Hex((27,26), None, 0, None, 0))
        d[27].append(Dr25Hex((27,27), None, 0, None, 0))
        d[27].append(Dr25Hex((27,28), None, 0, None, 0))
        d[27].append(Dr25Hex((27,29), None, 0, None, 0))
        d[27].append(Dr25Hex((27,30), None, 0, None, 0))
    def _column_28(self, d):
        d.append([])
        d[28].append(Dr25Hex((28,0), None, 0, None, 0))
        d[28].append(Dr25Hex((28,1), None, Dr25Hex.FOREST, None, 0))
        d[28].append(Dr25Hex((28,2), None, Dr25Hex.MOUNTAIN, None, 0))
        d[28].append(Dr25Hex((28,3), None, Dr25Hex.MOUNTAIN, None, 0))
        d[28].append(Dr25Hex((28,4), None, Dr25Hex.FOREST, None, 0))
        d[28].append(Dr25Hex((28,5), None, Dr25Hex.FOREST, None, 0))
        d[28].append(Dr25Hex((28,6), None, Dr25Hex.FOREST, None, 0))
        d[28].append(Dr25Hex((28,7), None, Dr25Hex.HILL|Dr25Hex.RIVER, None,
                             0))
        d[28].append(Dr25Hex((28,8), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[28].append(Dr25Hex((28,9), None, 0, names.Muetar, 0))
        d[28].append(Dr25Hex((28,10), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[28].append(Dr25Hex((28,11), None, Dr25Hex.FOREST, names.Pon, 0))
        d[28].append(Dr25Hex((28,12), None, Dr25Hex.FOREST, names.Pon, 0))
        d[28].append(Dr25Hex((28,13), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           names.Pon, 0))
        d[28].append(Dr25Hex((28,14), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           names.Pon, 0))
        d[28].append(Dr25Hex((28,15), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           names.Pon, 0))
        d[28].append(Dr25Hex((28,16), None, Dr25Hex.PASS, names.Pon, 0))
        d[28].append(Dr25Hex((28,17), 'Marzarbol',
                             Dr25Hex.CASTLE|Dr25Hex.ROYAL,
                             names.Pon, 4))
        d[28].append(Dr25Hex((28,18), None, Dr25Hex.MOUNTAIN, names.Pon, 0))
        d[28].append(Dr25Hex((28,19), None, Dr25Hex.FOREST, names.Pon, 0))
        d[28].append(Dr25Hex((28,20), None, Dr25Hex.SEASHORE, names.Shucassam,
                             0))
        d[28].append(Dr25Hex((28,21), None, Dr25Hex.SEASHORE, None, 0))
        d[28].append(Dr25Hex((28,22), None, Dr25Hex.SEASHORE, None, 0))
        d[28].append(Dr25Hex((28,23), None, Dr25Hex.SEASHORE, None, 0))
        d[28].append(Dr25Hex((28,24), None, 0, None, 0))
        d[28].append(Dr25Hex((28,25), None, 0, None, 0))
        d[28].append(Dr25Hex((28,26), None, 0, None, 0))
        d[28].append(Dr25Hex((28,27), None, 0, None, 0))
        d[28].append(Dr25Hex((28,28), None, 0, None, 0))
        d[28].append(Dr25Hex((28,29), None, 0, None, 0))
        d[28].append(Dr25Hex((28,30), None, 0, None, 0))
    def _column_29(self, d):
        d.append([])
        d[29].append(Dr25Hex((29,0), None, 0, None, 0))
        d[29].append(Dr25Hex((29,1), None, Dr25Hex.FOREST, None, 0))
        d[29].append(Dr25Hex((29,2), None, Dr25Hex.MOUNTAIN, None, 0))
        d[29].append(Dr25Hex((29,3), None, Dr25Hex.MOUNTAIN, None, 0))
        d[29].append(Dr25Hex((29,4), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                             None, 0))
        d[29].append(Dr25Hex((29,5), None, Dr25Hex.HILL|Dr25Hex.RIVER, None,
                             0))
        d[29].append(Dr25Hex((29,6), None, Dr25Hex.RIVER, None, 0))
        d[29].append(Dr25Hex((29,7), None, Dr25Hex.HILL, None, 0))
        d[29].append(Dr25Hex((29,8), None, Dr25Hex.FOREST, None, 0))
        d[29].append(Dr25Hex((29,9), None, Dr25Hex.HILL|Dr25Hex.RIVER, None,
                             0))
        d[29].append(Dr25Hex((29,10), None, Dr25Hex.RIVER, names.Muetar, 0))
        d[29].append(Dr25Hex((29,11), None, Dr25Hex.MOUNTAIN, None, 0))
        d[29].append(Dr25Hex((29,12), None, Dr25Hex.FOREST, names.Pon, 0))
        d[29].append(Dr25Hex((29,13), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           names.Pon, 0))
        d[29].append(Dr25Hex((29,14), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           names.Pon, 0))
        d[29].append(Dr25Hex((29,15), None, Dr25Hex.FOREST, None, 0))
        d[29].append(Dr25Hex((29,16), None, Dr25Hex.MOUNTAIN, names.Pon, 0))
        d[29].append(Dr25Hex((29,17), None, Dr25Hex.MOUNTAIN, names.Pon, 0))
        d[29].append(Dr25Hex((29,18), None, Dr25Hex.MOUNTAIN, names.Pon, 0))
        d[29].append(Dr25Hex((29,19), None, Dr25Hex.MOUNTAIN, names.Pon, 0))
        d[29].append(Dr25Hex((29,20), None, Dr25Hex.MOUNTAIN|Dr25Hex.SEASHORE,
                           names.Pon, 0))
        d[29].append(Dr25Hex((29,21), None, Dr25Hex.SEASHORE, names.Pon, 0))
        d[29].append(Dr25Hex((29,22), None, 0, None, 0))
        d[29].append(Dr25Hex((29,23), None, 0, None, 0))
        d[29].append(Dr25Hex((29,24), None, 0, None, 0))
        d[29].append(Dr25Hex((29,25), None, 0, None, 0))
        d[29].append(Dr25Hex((29,26), None, 0, None, 0))
        d[29].append(Dr25Hex((29,27), None, 0, None, 0))
        d[29].append(Dr25Hex((29,28), None, 0, None, 0))
        d[29].append(Dr25Hex((29,29), None, 0, None, 0))
        d[29].append(Dr25Hex((29,30), None, 0, None, 0))
    def _column_30(self, d):
        d.append([])
        d[30].append(Dr25Hex((30,0), None, 0, None, 0))
        d[30].append(Dr25Hex((30,1), None, 0, None, 0))
        d[30].append(Dr25Hex((30,2), None, Dr25Hex.MOUNTAIN, None, 0))
        d[30].append(Dr25Hex((30,3), names.Tower_of_Zards,
                             Dr25Hex.CASTLE|Dr25Hex.ROYAL,
                             names.Black_Hand, 6))
        d[30].append(Dr25Hex((30,4), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                             None, 0))
        d[30].append(Dr25Hex((30,5), None, 0, None, 0))
        d[30].append(Dr25Hex((30,6), None, 0, None, 0))
        d[30].append(Dr25Hex((30,7), None, Dr25Hex.HILL, None, 0))
        d[30].append(Dr25Hex((30,8), names.Mystic_Lake,
                             Dr25Hex.SCENIC|Dr25Hex.LAKESHORE,
                             None, 0))
        d[30].append(Dr25Hex((30,9), None, Dr25Hex.HILL, None, 0))
        d[30].append(Dr25Hex((30,10), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                             None, 0))
        d[30].append(Dr25Hex((30,11), None, Dr25Hex.MOUNTAIN, None, 0))
        d[30].append(Dr25Hex((30,12), None, Dr25Hex.MOUNTAIN, None, 0))
        d[30].append(Dr25Hex((30,13), None, 0, None, 0))
        d[30].append(Dr25Hex((30,14), None, 0, None, 0))
        d[30].append(Dr25Hex((30,15), names.Ghost_Wood, Dr25Hex.FOREST,
                             None, 0))
        d[30].append(Dr25Hex((30,16), None, Dr25Hex.MOUNTAIN, names.Pon, 0))
        d[30].append(Dr25Hex((30,17), None, Dr25Hex.HILL, None, 0))
        d[30].append(Dr25Hex((30,18), None, Dr25Hex.MOUNTAIN, names.Pon, 0))
        d[30].append(Dr25Hex((30,19), None, Dr25Hex.MOUNTAIN, names.Pon, 0))
        d[30].append(Dr25Hex((30,20), 'Grugongi', Dr25Hex.PORT, names.Pon, 3))
        d[30].append(Dr25Hex((30,21), None, Dr25Hex.HILL, names.Pon, 0))
        d[30].append(Dr25Hex((30,22), None, 0, None, 0))
        d[30].append(Dr25Hex((30,23), None, 0, None, 0))
        d[30].append(Dr25Hex((30,24), None, 0, None, 0))
        d[30].append(Dr25Hex((30,25), 'Field of the Laughing Dead',
                           Dr25Hex.ANCIENT_BATTLEFIELD, None, 0))
        d[30].append(Dr25Hex((30,26), None, 0, None, 0))
        d[30].append(Dr25Hex((30,27), None, 0, None, 0))
        d[30].append(Dr25Hex((30,28), None, 0, None, 0))
        d[30].append(Dr25Hex((30,29), None, 0, None, 0))
        d[30].append(Dr25Hex((30,30), None, 0, None, 0))
    def _column_31(self, d):
        d.append([])
        d[31].append(Dr25Hex((31,0), None, 0, None, 0))
        d[31].append(Dr25Hex((31,1), None, Dr25Hex.SWAMP, None, 0))
        d[31].append(Dr25Hex((31,2), None, Dr25Hex.MOUNTAIN, None, 0))
        d[31].append(Dr25Hex((31,3), None, Dr25Hex.MOUNTAIN, None, 0))
        d[31].append(Dr25Hex((31,4), None, Dr25Hex.MOUNTAIN, None, 0))
        d[31].append(Dr25Hex((31,5), None, 0, None, 0))
        d[31].append(Dr25Hex((31,6), 'The Wasted Dead',
                           Dr25Hex.ANCIENT_BATTLEFIELD, None, 0))
        d[31].append(Dr25Hex((31,7), None, Dr25Hex.HILL, None, 0))
        d[31].append(Dr25Hex((31,8), None, Dr25Hex.FOREST, None, 0))
        d[31].append(Dr25Hex((31,9), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[31].append(Dr25Hex((31,10), None, Dr25Hex.MOUNTAIN|Dr25Hex.RIVER,
                           names.Ghem, 0))
        d[31].append(Dr25Hex((31,11), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[31].append(Dr25Hex((31,12), None, 0, None, 0))
        d[31].append(Dr25Hex((31,13), None, Dr25Hex.FOREST, None, 0))
        d[31].append(Dr25Hex((31,14), None, 0, None, 0))
        d[31].append(Dr25Hex((31,15), None, 0, None, 0))
        d[31].append(Dr25Hex((31,16), None, 0, None, 0))
        d[31].append(Dr25Hex((31,17), None, 0, None, 0))
        d[31].append(Dr25Hex((31,18), None, 0, None, 0))
        d[31].append(Dr25Hex((31,19), None, Dr25Hex.MOUNTAIN, names.Pon, 0))
        d[31].append(Dr25Hex((31,20), None, Dr25Hex.HILL, names.Pon, 0))
        d[31].append(Dr25Hex((31,21), None, 0, None, 0))
        d[31].append(Dr25Hex((31,22), None, 0, None, 0))
        d[31].append(Dr25Hex((31,23), None, 0, None, 0))
        d[31].append(Dr25Hex((31,24), None, 0, None, 0))
        d[31].append(Dr25Hex((31,25), None, 0, None, 0))
        d[31].append(Dr25Hex((31,26), None, 0, None, 0))
        d[31].append(Dr25Hex((31,27), None, 0, None, 0))
        d[31].append(Dr25Hex((31,28), None, Dr25Hex.HILL, None, 0))
        d[31].append(Dr25Hex((31,29), None, Dr25Hex.HILL, None, 0))
        d[31].append(Dr25Hex((31,30), None, Dr25Hex.HILL, None, 0))
    def _column_32(self, d):
        d.append([])
        d[32].append(Dr25Hex((32,0), None, 0, None, 0))
        d[32].append(Dr25Hex((32,1), None, Dr25Hex.SWAMP, None, 0))
        d[32].append(Dr25Hex((32,2), None, 0, None, 0))
        d[32].append(Dr25Hex((32,3), None, Dr25Hex.MOUNTAIN, None, 0))
        d[32].append(Dr25Hex((32,4), None, Dr25Hex.FOREST, None, 0))
        d[32].append(Dr25Hex((32,5), None, Dr25Hex.FOREST, None, 0))
        d[32].append(Dr25Hex((32,6), None, 0, None, 0))
        d[32].append(Dr25Hex((32,7), None, 0, None, 0))
        d[32].append(Dr25Hex((32,8), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[32].append(Dr25Hex((32,9), 'Mines of Rosengg',
                           Dr25Hex.CASTLE|Dr25Hex.ROYAL, names.Ghem, 5))
        d[32].append(Dr25Hex((32,10), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[32].append(Dr25Hex((32,11), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[32].append(Dr25Hex((32,12), None, Dr25Hex.HILL, None, 0))
        d[32].append(Dr25Hex((32,13), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[32].append(Dr25Hex((32,14), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[32].append(Dr25Hex((32,15), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[32].append(Dr25Hex((32,16), None, 0, None, 0))
        d[32].append(Dr25Hex((32,17), None, 0, None, 0))
        d[32].append(Dr25Hex((32,18), None, 0, None, 0))
        d[32].append(Dr25Hex((32,19), None, Dr25Hex.HILL, None, 0))
        d[32].append(Dr25Hex((32,20), None, Dr25Hex.HILL, names.Pon, 0))
        d[32].append(Dr25Hex((32,21), None, Dr25Hex.HILL, None, 0))
        d[32].append(Dr25Hex((32,22), None, Dr25Hex.FOREST, None, 0))
        d[32].append(Dr25Hex((32,23), None, Dr25Hex.HILL, None, 0))
        d[32].append(Dr25Hex((32,24), None, 0, None, 0))
        d[32].append(Dr25Hex((32,25), None, 0, None, 0))
        d[32].append(Dr25Hex((32,26), None, Dr25Hex.FOREST, None, 0))
        d[32].append(Dr25Hex((32,27), 'Altars of Greystaff', Dr25Hex.SCENIC,
                           None, 0))
        d[32].append(Dr25Hex((32,28), None, Dr25Hex.HILL, None, 0))
        d[32].append(Dr25Hex((32,29), None, 0, None, 0))
        d[32].append(Dr25Hex((32,30), None, 0, None, 0))
    def _column_33(self, d):
        d.append([])
        d[33].append(Dr25Hex((33,0), None, 0, None, 0))
        d[33].append(Dr25Hex((33,1), None, Dr25Hex.SWAMP, None, 0))
        d[33].append(Dr25Hex((33,2), None, Dr25Hex.SWAMP, None, 0))
        d[33].append(Dr25Hex((33,3), None, Dr25Hex.HILL, None, 0))
        d[33].append(Dr25Hex((33,4), None, Dr25Hex.FOREST, None, 0))
        d[33].append(Dr25Hex((33,5), None, Dr25Hex.FOREST, None, 0))
        d[33].append(Dr25Hex((33,6), None, 0, None, 0))
        d[33].append(Dr25Hex((33,7), None, 0, None, 0))
        d[33].append(Dr25Hex((33,8), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[33].append(Dr25Hex((33,9), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[33].append(Dr25Hex((33,10), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[33].append(Dr25Hex((33,11), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[33].append(Dr25Hex((33,12), None, 0, None, 0))
        d[33].append(Dr25Hex((33,13), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[33].append(Dr25Hex((33,14), 'Alzak', Dr25Hex.CASTLE, names.Ghem, 4))
        d[33].append(Dr25Hex((33,15), None, Dr25Hex.HILL, None, 0))
        d[33].append(Dr25Hex((33,16), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[33].append(Dr25Hex((33,17), None, Dr25Hex.HILL, None, 0))
        d[33].append(Dr25Hex((33,18), names.City_of_Khos, Dr25Hex.SCENIC,
                           None, 0))
        d[33].append(Dr25Hex((33,19), None, 0, None, 0))
        d[33].append(Dr25Hex((33,20), None, 0, None, 0))
        d[33].append(Dr25Hex((33,21), 'The Digs', 0, names.Trolls, 0))
        d[33].append(Dr25Hex((33,22), None, Dr25Hex.HILL, None, 0))
        d[33].append(Dr25Hex((33,23), None, 0, None, 0))
        d[33].append(Dr25Hex((33,24), None, 0, None, 0))
        d[33].append(Dr25Hex((33,25), None, 0, None, 0))
        d[33].append(Dr25Hex((33,26), None, Dr25Hex.FOREST, None, 0))
        d[33].append(Dr25Hex((33,27), None, Dr25Hex.HILL, None, 0))
        d[33].append(Dr25Hex((33,28), None, Dr25Hex.HILL, None, 0))
        d[33].append(Dr25Hex((33,29), 'Wyrm\'s Lair', Dr25Hex.SCENIC, None, 0))
        d[33].append(Dr25Hex((33,30), None, 0, None, 0))
    def _column_34(self, d):
        d.append([])
        d[34].append(Dr25Hex((34,0), 'Witches\' Kitchen', 0, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,2), None, Dr25Hex.SWAMP, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,4), None, Dr25Hex.FOREST, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,6), None, 0, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,8), None, Dr25Hex.HILL, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,10), None, Dr25Hex.MOUNTAIN, names.Ghem, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,12), None, 0, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,14), None, Dr25Hex.HILL, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,16), None, 0, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,18), None, 0, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,20), None, 0, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,22), None, Dr25Hex.HILL, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,24), None, 0, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,26), None, 0, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,28), None, 0, None, 0))
        d[34].append(None)
        d[34].append(Dr25Hex((34,30), None, 0, None, 0))
