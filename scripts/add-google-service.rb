require 'xcodeproj'

# 프로젝트 경로 설정
project_path = 'ios/App/App.xcodeproj'
file_name = 'GoogleService-Info.plist'

puts "Attempting to add #{file_name} to Xcode project..."

project = Xcodeproj::Project.open(project_path)
target = project.targets.first
group = project.main_group['App'] # App 그룹 찾기

# 파일 참조가 이미 있는지 확인하고 없으면 추가
file_ref = group.files.find { |f| f.path == file_name }
if file_ref
  puts "#{file_name} reference already exists."
else
  file_ref = group.new_file(file_name)
  puts "Created file reference for #{file_name}."
end

# 빌드 페이즈(Copy Bundle Resources)에 추가
resources_phase = target.resources_build_phase
if resources_phase.files_references.include?(file_ref)
  puts "#{file_name} is already in Copy Bundle Resources phase."
else
  resources_phase.add_file_reference(file_ref)
  puts "Added #{file_name} to Copy Bundle Resources phase."
  project.save
  puts "Project saved successfully!"
end