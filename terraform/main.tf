module "eks" {
  source  = "terraform-aws-modules/eks/aws"

  version = "~> 21.0"

  name               = "kubeguardian"
  kubernetes_version = "1.33"

  eks_managed_node_groups = {
    default = {
      instance_types = ["t3.medium"]

      min_size     = 2
      max_size     = 3
      desired_size = 2
    }
  }
}