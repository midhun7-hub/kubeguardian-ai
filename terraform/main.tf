module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 6.0"

  name = "kubeguardian-vpc"
  cidr = "10.0.0.0/16"

  azs = [
    "ap-south-1a",
    "ap-south-1b"
  ]

  private_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ]

  public_subnets = [
    "10.0.101.0/24",
    "10.0.102.0/24"
  ]

  enable_nat_gateway = true
  single_nat_gateway = true

  public_subnet_tags = {
    "kubernetes.io/role/elb"             = "1"
    "kubernetes.io/cluster/kubeguardian" = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"    = "1"
    "kubernetes.io/cluster/kubeguardian" = "shared"
  }

  tags = {
    Project = "KubeGuardian"
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = var.cluster_name
  kubernetes_version = "1.32"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  endpoint_public_access  = true
  endpoint_private_access = true

  eks_managed_node_groups = {
    default = {
      instance_types = ["t3.micro"]

      desired_size = 1
      min_size     = 1
      max_size     = 2
    }
  }

  tags = {
    Project = "KubeGuardian"
  }
}

resource "aws_ecr_repository" "backend" {
  name = "kubeguardian-backend"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project = "KubeGuardian"
  }
}

resource "aws_ecr_repository" "frontend" {
  name = "kubeguardian-frontend"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project = "KubeGuardian"
  }
}