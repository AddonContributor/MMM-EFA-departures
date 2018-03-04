rm VVSLinien.txt
array=( S1 S11 S2 S3 S4 S5 S6 S60 U1 U2 U3 U4 U5 U6 U7 U8 U9 U10 U11 U12 U13)
for i in "${array[@]}"
do
	rm temp.txt
	rm temp2.txt
	curl 'http://www2.vvs.de/vvs/XSLT_ROP_REQUEST' -H 'Host: www2.vvs.de' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: de,en-US;q=0.7,en;q=0.3' --compressed -H 'Referer: http://www2.vvs.de/vvs/XSLT_ROP_REQUEST?language=de&mode=odv' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Connection: keep-alive' -H 'Upgrade-Insecure-Requests: 1' --data 'sessionID=0&requestID=0&language=de&command=&mode=line&net=&opBranch=&execInst=normal&mergeSup=0&mergeDir=1&lineName='$i'&efaResult=submit' > temp.txt
	grep "vvs\:[0-9][0-9][0-9][0-9][0-9]\:\s\:H" temp.txt > temp2.txt
	sed -i 'bak' $'s/></\\\n/g' temp2.txt
	grep "vvs\:[0-9][0-9][0-9][0-9][0-9]\:\s\:H" temp2.txt > temp.txt
	sed -i 'bak' $'s/option value="//g' temp.txt
	sed -i 'bak' $'s/" selected="selected">/ /g' temp.txt 
	sed -i 'bak' $'s/">/ /g' temp.txt 
	sed -i '.bak' 's@</option@ @g' temp.txt
	sed -i '.bak' 's@:j[0-9][0-9]:[0-9][0-9]*_[0-9]@@g' temp.txt
	sed -i '.bak' 's@:j[0-9][0-9]:[0-9][0-9]*_[0-9]@@g' temp.txt
	cat temp.txt >> VVSLinien.txt 
done
rm temp.txt
rm temp2.txt