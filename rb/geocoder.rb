#!/usr/local/rvm/bin/ruby
# -*- encoding : utf-8 -*-

require 'cgi'

c = CGI::new
q = c['q']

place = %x! geocode #{q} !

lat = lng = 0.0

place.split(/\n/).each do |l|
  if (l =~ /^Latitude/)
    lat = l.chomp.split(':').last.strip
  elsif (l =~ /^Longitude/)
    lng = l.chomp.split(':').last.strip
  end
end

data = "{'success':'true','lng':'#{lng}','lat':'#{lat}'}"

print <<EOF
Content-type: text/html

#{data}
EOF

