import json
import urllib.request
import urllib.error

def upload():
    with open('/Users/rch/tourcity.info/tourcity-admin/scratch/new_pois.json', 'r', encoding='utf-8') as f:
        pois = json.load(f)
    
    print(f"Starting upload of {len(pois)} POIs...")
    success_count = 0
    
    for poi in pois:
        try:
            req = urllib.request.Request(
                'http://localhost:3001/api/pois',
                data=json.dumps(poi).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            response = urllib.request.urlopen(req)
            print(f"[SUCCESS] Added: {poi['name_ru']}")
            success_count += 1
        except urllib.error.URLError as e:
            print(f"[ERROR] Failed to add {poi['name_ru']}: {e.reason}")
    
    print(f"\nUpload complete! Successfully added {success_count} out of {len(pois)} POIs to Google Sheets.")

if __name__ == '__main__':
    upload()
