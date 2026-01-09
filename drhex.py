"""This module contains the HexData class which describes the contents of a hex
in the DR map.
"""

class HexData:
    """This class describes the static content of a hex. This includes terrain
    (mountains, forest, etc), owning kingdom,  and additional information for
    castles, ports, scenic hexes, and ancient battlefields.
    """
    FOREST=0x0001
    HILL=0x0002
    MOUNTAIN=0x0004
    PASS=0x0008
    SWAMP=0x0010
    RIVER=0x0020
    LAKE=0x0040
    LAKESHORE=0x0080
    SEA=0x0100
    SEASHORE=0x0200
    CASTLE=0x0400
    PORT=0x0800
    SCENIC=0x1000
    ANCIENT_BATTLEFIELD=0x2000
    ROYAL=0x4000 # must be combined with CASTLE or PORT

    _TYPE_STRINGS=((ROYAL,'Royal'),
                  (CASTLE,'Castle'),
                  (PORT,'Port'),
                  (SCENIC,'Scenic'),
                  (FOREST,'Forest'),
                  (HILL,'Hill'),
                  (MOUNTAIN,'Mountain'),
                  (PASS,'Pass'),
                  (SWAMP,'Swamp'),
                  (RIVER,'River'),
                  (LAKE,'Lake'),
                  (LAKESHORE,'Lakeshore'),
                  (SEA,'Sea'),
                  (SEASHORE,'Seashore'),
                  (ANCIENT_BATTLEFIELD,'Ancient battlefield'))

    def __init__(self, location, name=None, type=0, kingdom=None, intrinsic=0):
        """Initialize a new instance.

        Arguments:
        location -- (column,row) tuple
        name -- the name of the hex (default None)
        type -- the type of the hex, specifying terrain type, castle, etc
            (default 0)
        kingdom -- the name of the owning kingdom (default None)
        intrinsic -- the intrinsic strength of the castle or port in the hex
            (default 0)
        """
        self.location = location
        self.name = name
        self.type = type
        self.kingdom = kingdom
        self.intrinsic = intrinsic

    def __str__(self):
        """Return string representation."""
        segs = []
        if self.kingdom:
            segs.append(self.kingdom)
        if self.is_castle() or self.is_port():
            if self.is_royal():
                segs.append(': Royal Castle - %s (%d)' %
                            (self.name, self.intrinsic))
            else:
                segs.append(': %s (%d)' % (self.name, self.intrinsic))
        elif self.name is not None:
            segs.append(': %s' % self.name)
        return ''.join(segs)

    def _make_type_string_list(self, strs):
        for hextype,type_str in DrHex._TYPE_STRINGS:
            if self.type & hextype:
                strs.append(type_str)

    def get_type(self):
        return self.type
    
    def get_type_string(self):
        strs = []
        self._make_type_string_list(strs)
        return '(%s)' % (','.join(strs),)
    
    def get_location(self):
        return self.location[0:]

    def get_name(self):
        return self.name

    def get_kingdom(self):
        return self.kingdom

    def get_intrinsic(self):
        return self.intrinsic

    def is_clear(self):
        """Return true if hex is a clear land hex."""
        return not (self.type & (self.FOREST | self.HILL | self.MOUNTAIN |
                                 self.PASS | self.SWAMP | self.RIVER |
                                 self.LAKE | self.SEA))
    
    def is_forest(self):
        """Return true if the hex contains forest."""
        return self.type & self.FOREST
    
    def is_hill(self):
        """Return true if the hex contains hills."""
        return self.type & self.HILL
    
    def is_mountain(self):
        """Return true if the hex contains mountains."""
        return self.type & self.MOUNTAIN
    
    def is_pass(self):
        """Return true if the hex contains a mountain pass."""
        return self.type & self.PASS
    
    def is_swamp(self):
        """Return true if the hex contains swamp."""
        return self.type & self.SWAMP
    
    def is_river(self):
        """Return true if the hex contains a river."""
        return self.type & self.RIVER
    
    def is_lake(self):
        """Return true if the entire hex is contained in a lake."""
        return self.type & self.LAKE
    
    def is_lakeshore(self):
        """Return true if a portion of the hex is in a lake."""
        return self.type & self.LAKESHORE
    
    def is_sea(self):
        """Return true if the entire hex is contained in the sea."""
        return self.type & self.SEA
    
    def is_seashore(self):
        """Return true if a portion of the hex is in the sea."""
        return self.type & self.SEASHORE
    
    def is_castle(self):
        """Return true if the hex contains a castle."""
        return self.type & self.CASTLE
    
    def is_port(self):
        """Return true if the hex contains a port."""
        return self.type & self.PORT

    def is_royal(self):
        """Return true if the hex contains a royal castle or port."""
        return self.type & self.ROYAL
    
    def is_scenic(self):
        """Return true if the hex is a scenic hex."""
        return self.type & self.SCENIC
    
    def is_ancient_battlefield(self):
        """Return true if the hex contains an ancient battlefield."""
        return self.type & self.ANCIENT_BATTLEFIELD

class DrHex(HexData):
    """This class describes the static content of a hex. This includes terrain
    (mountains, forest, etc), owning kingdom,  and additional information for
    castles, ports, scenic hexes, and ancient battlefields.
    """
    def __init__(self, location, name=None, type=0, kingdom=None, intrinsic=0):
        HexData.__init__(self, location, name, type, kingdom,
                         intrinsic)

    def is_castle_or_port(self):
        """Return true if the hex contains a castle or port."""
        return self.type & (self.CASTLE | self.PORT)

class Dr25Hex(HexData):
    """This class describes the static content of a hex. This includes terrain
    (mountains, forest, etc), owning kingdom,  and additional information for
    castles, ports, scenic hexes, and ancient battlefields.
    """

    # Additional types that are specific to DR25
    NON_CASTLE_PORT=0x08000
    NAVIGABLE=0x10000  # must be combined with RIVER
    
    _TYPE_STRINGS=((NON_CASTLE_PORT,'Non-castle Port'),
                   (NAVIGABLE,'Navigable'))

    def __init__(self, location, name=None, type=0, kingdom=None, intrinsic=0):
        HexData.__init__(self, location, name, type, kingdom, intrinsic)

    def _make_type_string_list(self, strs):
        HexData._make_type_string_list(self,strs)
        for hextype,type_str in self._TYPE_STRINGS:
            if self.type & hextype:
                strs.append(type_str)

    def is_non_castle_port(self):
        """Return true if the hex contains a non-castle port."""
        return self.type & self.NON_CASTLE_PORT

    def is_navigable(self):
        """Return true if the hex contains a navigable."""
        return self.type & self.NAVIGABLE

    def is_castle_or_port(self):
        """Return true if the hex contains a castle or port.

        Includes non-castle ports in the check.
        """
        return self.type & (self.CASTLE | self.PORT | self.NON_CASTLE_PORT)
