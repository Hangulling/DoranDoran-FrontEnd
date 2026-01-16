require 'xcodeproj'
require 'plist'

# 경로 설정
project_path = 'ios/App/App.xcodeproj'
target_name = 'App'
google_service_plist_path = 'ios/App/App/GoogleService-Info.plist'
info_plist_path = 'ios/App/App/Info.plist'

# GoogleService-Info.plist 파일이 실제로 있는지 확인
unless File.exist?(google_service_plist_path)
  puts "Error: #{google_service_plist_path} not found. Make sure to create it before running this script."
  exit 1
end

# Xcode 프로젝트에 GoogleService-Info.plist 파일 연결
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == target_name }
group = project.main_group.find_subpath('App', true)

file_ref = group.files.find { |f| f.path == 'GoogleService-Info.plist' }
unless file_ref
  file_ref = group.new_file('GoogleService-Info.plist')
  puts "Added GoogleService-Info.plist to file reference."
end

unless target.resources_build_phase.files_references.include?(file_ref)
  target.resources_build_phase.add_file_reference(file_ref)
  puts "Added GoogleService-Info.plist to build phase."
end

project.save

# REVERSED_CLIENT_ID 읽어서 Info.plist에 주입하기
puts "Injecting REVERSED_CLIENT_ID into Info.plist..."

# Google PLIST 읽기 (XML 파싱)
google_plist_content = Xcodeproj::Plist.read_from_path(google_service_plist_path)
reversed_client_id = google_plist_content['REVERSED_CLIENT_ID']

if reversed_client_id.nil? || reversed_client_id.empty?
  puts "Error: Could not find REVERSED_CLIENT_ID in GoogleService-Info.plist"
  exit 1
end

puts "Found REVERSED_CLIENT_ID: #{reversed_client_id}"

# Info.plist 읽기
info_plist = Xcodeproj::Plist.read_from_path(info_plist_path)

# URL Types 배열이 없으면 생성
info_plist['CFBundleURLTypes'] ||= []

# 이미 등록되어 있는지 확인
existing_scheme = info_plist['CFBundleURLTypes'].find do |type|
  type['CFBundleURLSchemes']&.include?(reversed_client_id)
end

if existing_scheme
  puts "URL Scheme already exists in Info.plist."
else
  # 새 스킴 추가
  new_url_type = {
    'CFBundleTypeRole' => 'Editor',
    'CFBundleURLSchemes' => [reversed_client_id]
  }
  info_plist['CFBundleURLTypes'] << new_url_type
  
  # 변경사항 저장
  Xcodeproj::Plist.write_to_path(info_plist, info_plist_path)
  puts "Successfully added #{reversed_client_id} to Info.plist!"
end