import re
NICE_FIX={'Telford':'Telford Central','Wellington (Shropshire)':'Wellington','Whitchurch (Shropshire)':'Whitchurch','Newport (South Wales)':'Newport','Wilnecote (Staffs)':'Wilnecote','University (Birmingham)':'University','Pontypool & New Inn':'Pontypool and New Inn'}
def nice(n):
    return NICE_FIX.get(n,n)
EXTRA={}
def osmname(n):
    return n
