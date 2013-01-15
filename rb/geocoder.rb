#!/usr/local/rvm/bin/ruby
# -*- encoding : utf-8 -*-

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
      if (dd[0].to_f > 90.0 and dd[1].to_f <= 90.0) # lat, lng
        lng = dd[0]
        lat = dd[1]
      elsif (dd[0].to_f <= 90.0 and dd[1].to_f > 90.0) # lng, lat
        lng = dd[1]
        lat = dd[0]
      end
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
end

data = "{'success':'true','lng':'#{lng}','lat':'#{lat}'}"

print <<EOF
Content-type: text/html

#{data}
EOF
