#!/usr/local/rvm/bin/ruby
# -*- encoding : utf-8 -*-

require 'rubygems'
require 'pg'
require 'cgi'

class String 
  def numeric? 
    Float(self) != nil rescue false 
  end 
end

def log(msg)
  log = open("/tmp/geocoder","a")
  log.write("#{msg}\n")
  log.close
end

def transform(lng,lat,srid)
  con = PGconn.connect("localhost",5432,nil,nil,"dsi","admin","")
  sql = "SELECT astext(transform(setsrid(GeometryFromText("
  sql += "'POINT(#{lng} #{lat})'),#{srid}),900913)) as google"
  res = con.exec(sql)
  con.close

  pt = res[0]['google']
  # POINT(11131949.0793274 1459732.2718805)
  ll = pt.gsub(/POINT/,'').tr('()','').split(' ')
end

def check(p1,p2)
  ll = []
  con = PGconn.connect("localhost",5432,nil,nil,"dsi","admin","")
  sql = "SELECT srid "
  sql += "FROM thaix "
  sql += "WHERE minx <= #{p1} AND maxx >= #{p1} "
  sql += "AND miny <= #{p2} AND maxy >= #{p2} "
  res = con.exec(sql)
  if res.count == 0
    tmp = p2
    p2 = p1
    p1 = tmp
    sql = "SELECT srid "
    sql += "FROM thaix "
    sql += "WHERE minx <= #{p1} AND maxx >= #{p1} "
    sql += "AND miny <= #{p2} AND maxy >= #{p2} "
    res = con.exec(sql)
  end
  con.close

  srid = 'NA'
  res.each do |rec|
    srid = rec['srid']
    break
  end  
  ll = []
  if srid != 'NA'
    lng = p1
    lat = p2
    ll = transform(lng,lat,srid)
  end
  ll
end

c = CGI::new
q = c['q']
q = q.strip

lat = lng = 0.0
place = nil

# Check if user input lat lng directly
if q.include?(' ')
  if q.count(' ') == 1 # 2 arguments
    dd = q.split(' ')
    if dd[0].numeric? and dd[1].numeric? # input has 2 numbers 
      ll = check(dd[0],dd[1])
      lng = ll[0]
      lat = ll[1]
    end
  else
    place = %x! geocode #{q} !
  end
else
  place = %x! geocode #{q} !
end

if place != nil
  place.split(/\n/).each do |l|
    if l =~ /^Longitude/
      lng = l.chomp.split(':').last.strip
    elsif l =~ /^Latitude/
      lat = l.chomp.split(':').last.strip
    end
  end
  ll = transform(lng,lat,4326)
  lng = ll[0]
  lat = ll[1]
end

data = "{'success':'true','lng':'#{lng}','lat':'#{lat}'}"

print <<EOF
Content-type: text/html

#{data}
EOF
